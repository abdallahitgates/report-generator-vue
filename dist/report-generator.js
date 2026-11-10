import { inject as $e, openBlock as s, createElementBlock as n, normalizeClass as oe, createElementVNode as e, provide as De, reactive as be, ref as B, computed as q, watch as ye, onMounted as Me, createVNode as O, createTextVNode as N, toDisplayString as w, withDirectives as se, vModelText as ce, Fragment as j, renderList as G, createCommentVNode as C, normalizeStyle as Se, TransitionGroup as je, withCtx as ue, createBlock as ae, Transition as tt, vModelCheckbox as mt, unref as F, Teleport as ul, mergeProps as dl, onBeforeUnmount as Fe, withModifiers as ge, renderSlot as pt, resolveComponent as cl, withKeys as Ke, vModelSelect as Re, vModelDynamic as wt, nextTick as Qt, vModelRadio as Zt, vShow as Xt } from "vue";
class el extends Error {
  constructor(o, { status: l = null, errors: r = {}, code: i = null, path: g = null, details: h = null, cause: a = null } = {}) {
    super(o), this.name = "ReportGeneratorApiError", this.status = l, this.errors = r, this.code = i, this.path = g, this.details = h, this.cause = a;
  }
}
function Rl(t) {
  var r;
  const o = (r = t == null ? void 0 : t.response) == null ? void 0 : r.data;
  return (o == null ? void 0 : o.errors) && Object.values(o.errors).flat()[0] || (o == null ? void 0 : o.message) || (t == null ? void 0 : t.message) || "Request failed";
}
function Dl({ http: t, basePath: o = "/api/report-generator" } = {}) {
  if (!t || typeof t.get != "function" || typeof t.post != "function")
    throw new TypeError("report-generator: pass an axios-compatible `http` instance (get/post/patch/delete).");
  const l = o.replace(/\/+$/, ""), r = (c) => `${l}/${c.replace(/^\/+/, "")}`;
  async function i(c, d, u, b) {
    var T, D, _, f, p, y, E, x, M;
    try {
      return (c === "get" || c === "delete" ? await t[c](r(d), b) : await t[c](r(d), u, b)).data;
    } catch ($) {
      throw new el(Rl($), {
        status: ((T = $ == null ? void 0 : $.response) == null ? void 0 : T.status) ?? null,
        errors: ((_ = (D = $ == null ? void 0 : $.response) == null ? void 0 : D.data) == null ? void 0 : _.errors) ?? {},
        code: ((p = (f = $ == null ? void 0 : $.response) == null ? void 0 : f.data) == null ? void 0 : p.code) ?? null,
        path: ((E = (y = $ == null ? void 0 : $.response) == null ? void 0 : y.data) == null ? void 0 : E.path) ?? null,
        details: ((M = (x = $ == null ? void 0 : $.response) == null ? void 0 : x.data) == null ? void 0 : M.details) ?? null,
        cause: $
      });
    }
  }
  async function g(c, d, u = "report") {
    var f, p, y, E;
    let b;
    try {
      b = await t.post(r(c), d, { responseType: "blob" });
    } catch (x) {
      let M = (f = x == null ? void 0 : x.response) == null ? void 0 : f.data;
      if (M && typeof M.text == "function")
        try {
          M = JSON.parse(await M.text());
        } catch {
          M = null;
        }
      throw new el((M == null ? void 0 : M.message) || (x == null ? void 0 : x.message) || "Export failed", {
        status: ((p = x == null ? void 0 : x.response) == null ? void 0 : p.status) ?? null,
        code: (M == null ? void 0 : M.code) ?? null,
        errors: (M == null ? void 0 : M.errors) ?? {},
        cause: x
      });
    }
    const T = ((y = b.headers) == null ? void 0 : y["content-disposition"]) ?? "", D = /filename\*=UTF-8''([^;]+)/i.exec(T) ?? /filename="?([^";]+)"?/i.exec(T), _ = D ? decodeURIComponent(D[1]) : u;
    if (typeof window < "u" && ((E = window.URL) != null && E.createObjectURL)) {
      const x = window.URL.createObjectURL(b.data), M = document.createElement("a");
      M.href = x, M.download = _, document.body.appendChild(M), M.click(), M.remove(), setTimeout(() => window.URL.revokeObjectURL(x), 1e3);
    }
    return _;
  }
  return {
    basePath: l,
    combine: {
      reports: () => i("get", "combine/reports").then((c) => c.data),
      fields: (c, { level: d, period: u, lines: b = [] } = {}) => i("get", `combine/reports/${encodeURIComponent(c)}/fields`, void 0, {
        params: { level: d, ...u ? { period: u } : {}, ...b.length ? { lines: b } : {} }
      }).then((T) => T.data)
    },
    dashboards: {
      list: () => i("get", "dashboards").then((c) => c.data),
      get: (c) => i("get", `dashboards/${c}`).then((d) => d.data),
      create: (c) => i("post", "dashboards", c).then((d) => d.data),
      update: (c, d) => i("patch", `dashboards/${c}`, d).then((u) => u.data),
      remove: (c) => i("delete", `dashboards/${c}`),
      /** A first layout for a report: { name, context, widgets }. */
      generate: (c) => i("post", "dashboards-generate", { report: c }).then((d) => d.data),
      /** One saved widget's data with the viewer's report filters. */
      widget: (c, d, { context: u } = {}) => i("post", `dashboards/${c}/widgets/${encodeURIComponent(d)}`, u ? { context: u } : {}),
      /** A widget being edited. */
      preview: (c, { context: d } = {}) => i("post", "dashboards-preview", { widget: c, ...d ? { context: d } : {} }),
      publishing: (c) => i("get", `dashboards/${c}/publish`).then((d) => d.data),
      publish: (c, { permission: d, roles: u = [], inMenu: b = !1, menuGroup: T = null }) => i("put", `dashboards/${c}/publish`, {
        permission: d,
        roles: u,
        in_menu: b,
        menu_group: T
      }).then((D) => D.data),
      unpublish: (c) => i("delete", `dashboards/${c}/publish`).then((d) => d.data),
      /** Adds a widget to a dashboard you own; returns the dashboard. */
      pin: (c, d) => i("post", `dashboards/${c}/pin`, { widget: d }).then((u) => u.data)
    },
    query: {
      /** Without a root: topics to start from, by tab. With a root: its relation tree and a flat list for the builder. */
      catalog: (c) => i("get", "catalog", void 0, c ? { params: { root: c } } : void 0),
      validate: (c, d = {}) => i("post", "query/validate", { definition: c, parameters: d }),
      /**
       * One page of results. groups = { columns: [aliases], keys: [opened group values] }
       * for AG Grid's server-side row model; queryId lets cancel() stop it.
       */
      rows: (c, { parameters: d = {}, offset: u = 0, size: b, groups: T, queryId: D, signal: _ } = {}) => i(
        "post",
        "query/rows",
        { definition: c, parameters: d, page: { offset: u, ...b ? { size: b } : {} }, ...T ? { groups: T } : {}, ...D ? { query_id: D } : {} },
        _ ? { signal: _ } : void 0
      ),
      values: (c, d = "", u = 50) => i("post", "query/values", { field: c, search: d, limit: u }).then((b) => b.data),
      /** Row count and grand totals of the whole report: { rows, totals, duration_ms, cached }. */
      summary: (c, d = {}) => i("post", "query/summary", { definition: c, parameters: d }),
      /** Streams the whole report as a file (format: csv | xlsx) and saves it. */
      export: (c, d, { parameters: u = {}, name: b } = {}) => g("query/export", { definition: c, parameters: u, format: d, name: b }, b),
      cancel: (c) => i("post", `query/${encodeURIComponent(c)}/cancel`)
    },
    reports: {
      list: (c = {}) => i("get", "reports", void 0, { params: c }),
      get: (c) => i("get", `reports/${c}`).then((d) => d.data),
      create: (c) => i("post", "reports", c).then((d) => d.data),
      update: (c, d) => i("patch", `reports/${c}`, d).then((u) => u.data),
      duplicate: (c) => i("post", `reports/${c}/duplicate`).then((d) => d.data),
      remove: (c) => i("delete", `reports/${c}`),
      share: (c, d, u) => i("put", `reports/${c}/shares`, { shares: d, ...u ? { visibility: u } : {} }).then((b) => b.data),
      /** Publishing: settings (with a suggested permission), publish, unpublish. Needs the publish ability. */
      publishing: (c) => i("get", `reports/${c}/publish`).then((d) => d.data),
      publish: (c, { permission: d, roles: u = [], inMenu: b = !1, menuGroup: T = null }) => i("put", `reports/${c}/publish`, {
        permission: d,
        roles: u,
        in_menu: b,
        menu_group: T
      }).then((D) => D.data),
      unpublish: (c) => i("delete", `reports/${c}/publish`).then((d) => d.data),
      /** Opening a saved report as it was saved (anyone who may open it). */
      view: (c) => i("get", `reports/${c}/view`).then((d) => d.data),
      run: (c, { parameters: d = {}, context: u, sort: b, offset: T = 0, size: D, groups: _, queryId: f, signal: p } = {}) => i(
        "post",
        `reports/${c}/rows`,
        {
          parameters: d,
          ...u ? { context: u } : {},
          ...b ? { sort: b } : {},
          page: { offset: T, ...D ? { size: D } : {} },
          ..._ ? { groups: _ } : {},
          ...f ? { query_id: f } : {}
        },
        p ? { signal: p } : void 0
      ),
      values: (c, d, u = "", b = 50) => i("post", `reports/${c}/values`, { field: d, search: u, limit: b }).then((T) => T.data),
      summary: (c, { parameters: d = {}, context: u, sort: b } = {}) => i("post", `reports/${c}/summary`, {
        parameters: d,
        ...u ? { context: u } : {},
        ...b ? { sort: b } : {}
      }),
      export: (c, d, { parameters: u = {}, context: b, sort: T } = {}) => g(`reports/${c}/export`, {
        format: d,
        parameters: u,
        ...b ? { context: b } : {},
        ...T ? { sort: T } : {}
      })
    },
    /** Version, the current user's abilities, registered sources and limits. */
    meta: () => i("get", "meta"),
    /** Published reports in the menu the current user may open: [{ uuid, name, description, group }]. */
    menu: () => i("get", "menu").then((c) => c.data),
    /** Choices for a report filter (kind: lines | divisions | employees): [{ id, label }]. */
    contextOptions: (c, { search: d = "", lines: u = [], period: b } = {}) => i("get", `context/${c}`, void 0, {
      params: { ...d ? { search: d } : {}, ...u.length ? { lines: u } : {}, ...b ? { period: b } : {} }
    }).then((T) => T.data),
    /** Roles a report can be published to: [{ id, name }]. */
    roles: () => i("get", "permissions/roles").then((c) => c.data),
    /** Every topic by tab, with filter columns, fields and relations (admins). */
    topics: () => i("get", "topics"),
    request: i
  };
}
const gl = Symbol("report-generator");
function Nv(t = {}) {
  const o = Dl(t);
  return {
    api: o,
    install(l) {
      l.provide(gl, { api: o });
    }
  };
}
function Pe() {
  const t = $e(gl, null);
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
}, xt = {
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
    const o = {
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
    return (l, r) => (s(), n("svg", {
      class: oe(["rg-icon", { "rg-icon--sm": t.small, "rg-spin": t.spin }]),
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      focusable: "false"
    }, [
      e("path", {
        d: o[t.name] || o.alert
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
}, Gl = { class: "rg-sidebar" }, Kl = { class: "rg-skeleton-list" }, Hl = {
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
}, Gs = {
  key: 1,
  class: "rg-topic__relations"
}, Ks = ["onClick"], Hs = ["data-kind"], Ws = { class: "rg-topic__relation-text" }, Ys = {
  key: 0,
  class: "rg-faint"
}, Js = {
  key: 1,
  class: "rg-faint"
}, Qs = { class: "rg-mono" }, Vv = {
  __name: "TopicsBrowser",
  props: {
    theme: { type: String, default: "light" },
    /** Topic key to open first. */
    initialTopic: { type: String, default: null }
  },
  emits: ["select"],
  setup(t, { emit: o }) {
    const l = t, r = o, { api: i } = Pe();
    De("rg-theme", l.theme);
    const g = be({ loading: !0, error: null, groups: [], group: null, topic: null }), h = B(""), a = B(!1), v = [
      { key: "period", label: "Period", icon: "calendar" },
      { key: "line", label: "Line", icon: "folder" },
      { key: "division", label: "Division", icon: "users" },
      { key: "employee", label: "Employee", icon: "users" }
    ], A = Object.fromEntries(Ll.map((x) => [x.value, x.label])), c = q(() => g.groups.flatMap((x) => x.topics)), d = q(() => Object.fromEntries(c.value.map((x) => [x.key, x]))), u = q(() => d.value[g.topic] ?? null), b = q(() => {
      var M;
      const x = h.value.trim().toLowerCase();
      return x ? c.value.filter(($) => $.label.toLowerCase().includes(x) || $.key.includes(x) || $.fields.some((W) => W.label.toLowerCase().includes(x))) : ((M = g.groups.find(($) => $.name === g.group)) == null ? void 0 : M.topics) ?? [];
    }), T = q(() => {
      var x;
      return (((x = u.value) == null ? void 0 : x.fields) ?? []).filter((M) => a.value || !M.hidden);
    }), D = q(() => {
      var x;
      return (((x = u.value) == null ? void 0 : x.fields) ?? []).filter((M) => M.hidden).length;
    });
    async function _() {
      var x, M;
      g.loading = !0, g.error = null;
      try {
        const $ = await i.topics();
        g.groups = $.groups ?? [], f(l.initialTopic && d.value[l.initialTopic] ? l.initialTopic : (M = (x = g.groups[0]) == null ? void 0 : x.topics[0]) == null ? void 0 : M.key);
      } catch ($) {
        g.error = $.message;
      } finally {
        g.loading = !1;
      }
    }
    function f(x) {
      const M = d.value[x];
      M && (g.topic = x, g.group = M.group ?? g.group);
    }
    function p(x) {
      var $, W;
      g.group = x, h.value = "";
      const M = ($ = g.groups.find((re) => re.name === x)) == null ? void 0 : $.topics[0];
      M && ((W = u.value) == null ? void 0 : W.group) !== x && (g.topic = M.key);
    }
    ye(() => g.topic, (x) => x && r("select", x));
    function y(x) {
      return Object.entries(x.conditions ?? {}).map(([M, $]) => ({
        column: M,
        text: $ === null ? "is empty" : Array.isArray($) ? `in ${$.join(", ")}` : `= ${$}`
      }));
    }
    function E(x, M) {
      var $;
      return (($ = x.columns) == null ? void 0 : $[M]) ?? null;
    }
    return Me(_), (x, M) => (s(), n("div", {
      class: "rg-root rg-topics",
      "data-rg-theme": t.theme
    }, [
      e("header", Fl, [
        e("div", Pl, [
          M[3] || (M[3] = e("h1", null, "Topics", -1)),
          e("div", Ul, [
            e("span", null, [
              O(P, {
                name: "folder",
                small: ""
              }),
              N(w(g.groups.length) + " tabs", 1)
            ]),
            e("span", null, [
              O(P, {
                name: "table",
                small: ""
              }),
              N(w(c.value.length) + " topics", 1)
            ]),
            M[2] || (M[2] = e("span", null, [
              N("Defined in code: "),
              e("span", { class: "rg-mono" }, "app/Reporting/Topics")
            ], -1))
          ])
        ]),
        e("label", Il, [
          M[4] || (M[4] = e("span", { class: "rg-sr-only" }, "Search topics and fields", -1)),
          O(P, { name: "search" }),
          se(e("input", {
            "onUpdate:modelValue": M[0] || (M[0] = ($) => h.value = $),
            class: "rg-input",
            type: "search",
            placeholder: "Search topics and fields",
            autocomplete: "off"
          }, null, 512), [
            [ce, h.value]
          ])
        ])
      ]),
      g.groups.length ? (s(), n("nav", ql, [
        (s(!0), n(j, null, G(g.groups, ($) => (s(), n("button", {
          key: $.name,
          type: "button",
          role: "tab",
          class: "rg-topics__tab",
          "aria-selected": !h.value && g.group === $.name,
          onClick: (W) => p($.name)
        }, [
          N(w($.name), 1),
          e("span", zl, w($.topics.length), 1)
        ], 8, jl))), 128))
      ])) : C("", !0),
      g.loading ? (s(), n("div", Bl, [
        e("aside", Gl, [
          e("div", Kl, [
            (s(), n(j, null, G(6, ($) => e("div", {
              key: $,
              class: "rg-skeleton",
              style: Se({ width: `${50 + $ * 37 % 45}%` })
            }, null, 4)), 64))
          ])
        ]),
        M[5] || (M[5] = e("main", { class: "rg-main" }, null, -1))
      ])) : g.error ? (s(), n("div", Hl, [
        e("div", Wl, [
          e("div", Yl, [
            O(P, { name: "alert" })
          ]),
          M[6] || (M[6] = e("h2", null, "Topics could not be loaded", -1)),
          e("p", null, w(g.error), 1),
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: _
          }, "Try again")
        ])
      ])) : c.value.length ? (s(), n("div", Xl, [
        e("aside", es, [
          O(je, {
            tag: "ul",
            name: "rg-list-fade",
            class: "rg-list",
            "aria-label": h.value ? "Matching topics" : g.group
          }, {
            default: ue(() => [
              (s(!0), n(j, null, G(b.value, ($) => (s(), n("li", {
                key: $.key
              }, [
                e("button", {
                  type: "button",
                  class: "rg-list__item",
                  "aria-current": $.key === g.topic,
                  onClick: (W) => f($.key)
                }, [
                  e("span", ls, w($.label), 1),
                  e("span", ss, [
                    $.permission ? (s(), ae(P, {
                      key: 0,
                      name: "lock",
                      small: "",
                      title: `Needs ${$.permission}`
                    }, null, 8, ["title"])) : C("", !0),
                    $.public ? (s(), ae(P, {
                      key: 1,
                      name: "globe",
                      small: "",
                      title: "Anyone may read it in full"
                    })) : C("", !0)
                  ]),
                  e("span", ns, [
                    e("span", as, w($.table), 1),
                    e("span", null, "· " + w($.fields_count) + " fields", 1),
                    h.value ? (s(), n("span", os, "· " + w($.group), 1)) : C("", !0)
                  ])
                ], 8, ts)
              ]))), 128))
            ]),
            _: 1
          }, 8, ["aria-label"]),
          b.value.length ? C("", !0) : (s(), n("p", rs, "Nothing matches “" + w(h.value) + "”.", 1))
        ]),
        e("main", is, [
          O(tt, {
            name: "rg-swap",
            mode: "out-in"
          }, {
            default: ue(() => [
              u.value ? (s(), n("section", {
                key: u.value.key,
                class: "rg-panel rg-topic"
              }, [
                e("div", us, [
                  e("div", ds, [
                    e("h2", cs, w(u.value.label), 1),
                    e("div", gs, [
                      e("span", null, [
                        O(P, {
                          name: "key",
                          small: ""
                        }),
                        e("span", ms, w(u.value.key), 1)
                      ]),
                      e("span", null, [
                        O(P, {
                          name: "table",
                          small: ""
                        }),
                        e("span", ps, w(u.value.table), 1)
                      ]),
                      e("span", vs, w(u.value.class), 1)
                    ]),
                    u.value.description ? (s(), n("p", fs, w(u.value.description), 1)) : C("", !0),
                    y(u.value).length ? (s(), n("p", bs, [
                      O(P, {
                        name: "filter",
                        small: ""
                      }),
                      M[10] || (M[10] = N(" Only rows where ", -1)),
                      (s(!0), n(j, null, G(y(u.value), ($, W) => (s(), n(j, {
                        key: $.column
                      }, [
                        W ? (s(), n("span", hs, "and")) : C("", !0),
                        e("code", ys, w($.column) + " " + w($.text), 1)
                      ], 64))), 128))
                    ])) : C("", !0)
                  ]),
                  e("div", $s, [
                    u.value.permission ? (s(), n("span", _s, [
                      O(P, {
                        name: "lock",
                        small: ""
                      }),
                      N(w(u.value.permission), 1)
                    ])) : C("", !0),
                    u.value.public ? (s(), n("span", ks, [
                      O(P, {
                        name: "globe",
                        small: ""
                      }),
                      M[11] || (M[11] = N("Public lookup", -1))
                    ])) : C("", !0),
                    u.value.startable === !1 ? (s(), n("span", ws, [
                      O(P, {
                        name: "link",
                        small: ""
                      }),
                      M[12] || (M[12] = N("Link table", -1))
                    ])) : C("", !0),
                    u.value.lookup ? (s(), n("span", xs, [
                      O(P, {
                        name: "link",
                        small: ""
                      }),
                      M[13] || (M[13] = N("Joined only", -1))
                    ])) : C("", !0)
                  ])
                ]),
                e("div", Cs, [
                  M[14] || (M[14] = e("div", { class: "rg-card__head" }, [
                    e("h2", null, "Report filters"),
                    e("span", { class: "rg-muted" }, "Every report on this topic can be limited by these")
                  ], -1)),
                  e("ul", Ss, [
                    (s(), n(j, null, G(v, ($) => e("li", {
                      key: $.key,
                      class: oe({ "is-off": !u.value.filters[$.key] })
                    }, [
                      O(P, {
                        name: u.value.filters[$.key] ? "check" : "x",
                        small: ""
                      }, null, 8, ["name"]),
                      e("b", null, w($.label), 1),
                      E(u.value, $.key) ? (s(), n("span", Ms, w(E(u.value, $.key)), 1)) : C("", !0)
                    ], 2)), 64))
                  ])
                ]),
                e("div", Ts, [
                  e("div", Es, [
                    e("h2", null, [
                      M[15] || (M[15] = N("Fields ", -1)),
                      e("span", As, w(T.value.length), 1)
                    ]),
                    D.value ? (s(), n("label", Os, [
                      se(e("input", {
                        "onUpdate:modelValue": M[1] || (M[1] = ($) => a.value = $),
                        type: "checkbox",
                        class: "rg-check"
                      }, null, 512), [
                        [mt, a.value]
                      ]),
                      N(" Show " + w(D.value) + " id " + w(D.value === 1 ? "column" : "columns"), 1)
                    ])) : C("", !0)
                  ]),
                  e("div", Rs, [
                    e("table", Ds, [
                      M[16] || (M[16] = e("thead", null, [
                        e("tr", null, [
                          e("th", null, "Field"),
                          e("th", null, "Type"),
                          e("th", null, "Use"),
                          e("th", null, "Totals")
                        ])
                      ], -1)),
                      O(je, {
                        tag: "tbody",
                        name: "rg-list-fade"
                      }, {
                        default: ue(() => [
                          (s(!0), n(j, null, G(T.value, ($) => (s(), n("tr", {
                            key: $.key,
                            class: oe(["rg-topic__field", { "rg-row--hidden": $.hidden }])
                          }, [
                            e("td", null, [
                              e("div", Ls, [
                                e("b", null, w($.label), 1),
                                e("span", Ns, [
                                  e("span", Vs, w($.key), 1),
                                  $.description ? (s(), n("span", Fs, "· " + w($.description), 1)) : C("", !0)
                                ])
                              ])
                            ]),
                            e("td", null, [
                              e("span", Ps, [
                                O(P, {
                                  name: F(Nt)[$.type] ?? "text",
                                  small: ""
                                }, null, 8, ["name"]),
                                N(w($.type), 1)
                              ])
                            ]),
                            e("td", null, [
                              e("span", {
                                class: oe(["rg-badge rg-role", `rg-role--${$.role}`])
                              }, w($.key === "__rows" ? "Count" : F(A)[$.role] ?? $.role), 3),
                              $.options ? (s(), n("span", {
                                key: 0,
                                class: "rg-faint rg-topic__options",
                                title: Object.values($.options).join(", ")
                              }, w(Object.keys($.options).length) + " values ", 9, Us)) : C("", !0)
                            ]),
                            e("td", Is, w(($.aggregations ?? []).map((W) => F(xt)[W] ?? W).join(", ") || "—"), 1)
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
                      M[17] || (M[17] = N("Relations ", -1)),
                      e("span", zs, w(u.value.relations.length), 1)
                    ]),
                    M[18] || (M[18] = e("span", { class: "rg-muted" }, "Fields of these topics can be added to its reports", -1))
                  ]),
                  u.value.relations.length ? (s(), n("ul", Gs, [
                    (s(!0), n(j, null, G(u.value.relations, ($) => (s(), n("li", {
                      key: $.name
                    }, [
                      e("button", {
                        type: "button",
                        class: "rg-topic__relation",
                        onClick: (W) => f($.topic)
                      }, [
                        e("span", {
                          class: "rg-topic__relation-kind",
                          "data-kind": $.type
                        }, w($.type === "hasMany" ? "many" : "one"), 9, Hs),
                        e("span", Ws, [
                          e("b", null, w($.label), 1),
                          $.through ? (s(), n("span", Ys, w($.topic_label) + " · via " + w($.through), 1)) : (s(), n("span", Js, [
                            N(w($.topic_label) + " · ", 1),
                            e("span", Qs, w($.foreign_key), 1)
                          ]))
                        ]),
                        O(P, {
                          name: "arrow",
                          small: ""
                        })
                      ], 8, Ks)
                    ]))), 128))
                  ])) : (s(), n("p", Bs, "This topic does not link to other topics."))
                ])
              ])) : C("", !0)
            ]),
            _: 1
          })
        ])
      ])) : (s(), n("div", Jl, [
        e("div", Ql, [
          e("div", Zl, [
            O(P, { name: "database" })
          ]),
          M[7] || (M[7] = e("h2", null, "No topics yet", -1)),
          M[8] || (M[8] = e("p", null, "Topics are PHP classes in your app. Draft one from a model, then edit its labels:", -1)),
          M[9] || (M[9] = e("code", { class: "rg-mono" }, 'php artisan report-generator:make-topic ActualVisits --model="App\\ActualVisit"', -1))
        ])
      ]))
    ], 8, Vl));
  }
};
let Zs = 1;
const He = () => `f${Zs++}`, Vt = "__rows", Ft = {
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
function Pt(t, o = !1) {
  return o ? sn : t === "integer" || t === "decimal" ? en : t === "date" || t === "datetime" ? tn : t === "boolean" ? ln : Xs;
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
  const o = String(t).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
  return /^[a-z_]/.test(o) ? o || "field" : `f_${o}`;
}
function Ut(t, o, l = null) {
  const r = new Set([...t.rows, ...t.values].filter((g) => g !== l).map((g) => g.as));
  let i = ll(o);
  for (let g = 2; r.has(i); g++) i = `${ll(o)}_${g}`;
  return i;
}
function ml(t, o, l) {
  if (o.key === Vt || t.key === l && !t.label.includes(" › ")) return o.label;
  const r = t.label.split(" › "), i = r[r.length - 1], g = o.label.toLowerCase().includes(i.toLowerCase()) ? o.label : `${i} ${o.label}`;
  return [...r.slice(0, -1), g].join(" › ");
}
function gt(t) {
  return t.field === Vt ? t.baseLabel : `${xt[t.agg] ?? t.agg} of ${t.baseLabel}`;
}
function Et(t, o, l, { path: r = null, asValue: i = null } = {}) {
  var v;
  const g = ml(o, l, t.root), h = i ?? l.role === "measure", a = {
    uid: He(),
    kind: h ? "measure" : "dimension",
    dataset: o.key,
    datasetLabel: o.label,
    field: l.key,
    type: l.type,
    role: l.role,
    aggregations: (v = l.aggregations) != null && v.length ? l.aggregations : ["count", "count_distinct"],
    baseLabel: g,
    grain: null,
    agg: null,
    path: r,
    format: null
  };
  return h ? (a.agg = a.aggregations.includes("sum") ? "sum" : a.aggregations[0], a.label = gt(a)) : (l.role === "time" && (a.grain = "month"), a.label = g), a.as = Ut(t, a.label), a;
}
function nn(t, o, l) {
  return { uid: He(), kind: "formula", label: o, formula: l, as: Ut(t, o), format: null };
}
function an(t) {
  if (t.kind === "formula")
    return { formula: t.formula, as: t.as, label: t.label, ...t.format ? { format: t.format } : {} };
  const o = { ref: `${t.dataset}.${t.field}`, as: t.as, label: t.label };
  return t.kind === "measure" && (o.agg = t.agg), t.kind === "dimension" && t.grain && (o.grain = t.grain), t.path && (o.path = t.path), t.format && (o.format = t.format), o;
}
function pl(t) {
  if (t.items)
    return { [t.boolean]: t.items.map(pl).filter(Boolean) };
  const o = { field: t.target, op: t.op };
  return ["is_null", "not_null"].includes(t.op) || (o.value = t.value), t.path && (o.path = t.path), o;
}
function on(t) {
  if (t.items || ["is_null", "not_null"].includes(t.op)) return !0;
  const o = t.value;
  return o == null || o === "" ? !1 : Array.isArray(o) ? t.op === "between" ? o.length === 2 && o.every((l) => l !== "" && l !== null) : o.length > 0 : !0;
}
function vl(t) {
  return { boolean: t.boolean, items: t.items.filter(on).map((o) => o.items ? vl(o) : o) };
}
function fl(t) {
  const o = [...t.rows, ...t.values], l = {};
  o.forEach((g, h) => l[`fields.${h}`] = g.uid);
  const r = {
    version: 1,
    root: t.root,
    fields: o.map(an),
    sort: t.sort.filter((g) => o.some((h) => h.as === g.field)),
    subtotals: t.subtotals,
    ui: { grouped: t.grouped, rows: t.rows.map((g) => g.as) }
  };
  t.parameters.length && (r.parameters = t.parameters);
  const i = vl(t.filters);
  if (i.items.length) {
    r.filters = pl(i);
    const g = (h, a) => h.items.forEach((v, A) => {
      const c = `${a}.${h.boolean}.${A}`;
      v.items ? g(v, c) : l[c] = v.uid;
    });
    g(i, "filters");
  }
  return { definition: r, locations: l };
}
function rn(t, o, l = {}) {
  var a, v, A;
  const r = Dt();
  r.root = t.root, r.subtotals = !!t.subtotals, r.grouped = ((a = t.ui) == null ? void 0 : a.grouped) ?? !0, r.parameters = t.parameters ?? [], r.sort = t.sort ?? [], Object.assign(r, {
    uuid: l.uuid ?? null,
    name: l.name ?? r.name,
    description: l.description ?? "",
    folder: l.folder ?? "",
    visibility: l.visibility ?? "private",
    canEdit: l.can_edit ?? !0,
    canPublish: l.can_publish ?? !1,
    published: l.published ?? !1
  });
  const i = Object.fromEntries(o.map((c) => [c.key, c])), g = new Set(((v = t.ui) == null ? void 0 : v.rows) ?? []);
  for (const c of t.fields ?? []) {
    if (c.formula) {
      r.values.push({ uid: He(), kind: "formula", label: c.label ?? c.as, formula: c.formula, as: c.as, format: c.format ?? null });
      continue;
    }
    const [d, u] = c.ref.split("."), b = i[d] ?? { key: d, label: d, fields: [] }, T = b.fields.find((f) => f.key === u) ?? { key: u, label: u, type: "string", role: "dimension", aggregations: [] }, D = !!c.agg && !g.has(c.as), _ = {
      uid: He(),
      kind: D ? "measure" : "dimension",
      dataset: d,
      datasetLabel: b.label,
      field: u,
      type: T.type,
      role: T.role,
      aggregations: (A = T.aggregations) != null && A.length ? T.aggregations : ["count", "count_distinct"],
      baseLabel: ml(b, T, t.root),
      grain: c.grain ?? null,
      agg: c.agg ?? null,
      path: c.path ?? null,
      format: c.format ?? null,
      as: c.as,
      label: c.label ?? c.as,
      missing: !i[d] || !b.fields.some((f) => f.key === u)
    };
    (D ? r.values : r.rows).push(_);
  }
  const h = (c) => {
    const d = c.and ? "and" : c.or ? "or" : null;
    return d ? { uid: He(), boolean: d, items: c[d].map(h) } : { uid: He(), target: c.field, op: c.op, value: c.value ?? null, path: c.path ?? null };
  };
  if (t.filters) {
    const c = h(t.filters);
    r.filters = c.items ? { boolean: c.boolean, items: c.items } : { boolean: "and", items: [c] };
  }
  return r;
}
function un(t) {
  return !!t.root && t.rows.length + t.values.length > 0;
}
const dn = 60, sl = 200;
function cn() {
  var t, o;
  return ((o = (t = globalThis.crypto) == null ? void 0 : t.randomUUID) == null ? void 0 : o.call(t)) ?? `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function gn(t, o) {
  const l = be({
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
  }), r = { past: [], future: [], applying: !1 }, i = q(() => fl(l.draft)), g = q(() => i.value.definition), h = q(() => un(l.draft)), a = q(() => {
    var K;
    return Object.fromEntries((((K = l.catalog) == null ? void 0 : K.datasets) ?? []).map((z) => [z.key, z]));
  }), v = q(() => l.draft.grouped && l.draft.rows.length >= 2), A = () => JSON.stringify(l.draft), c = q(() => l.savedSnapshot !== null && A() !== l.savedSnapshot);
  let d = null, u = null;
  ye(() => A(), (K) => {
    if (r.applying) {
      u = K;
      return;
    }
    clearTimeout(d), d = setTimeout(() => {
      u !== null && u !== K && (r.past.push(u), r.past.length > dn && r.past.shift(), r.future = [], T()), u = K;
    }, 250);
  });
  function b(K) {
    r.applying = !0, Object.assign(l.draft, JSON.parse(K)), queueMicrotask(() => r.applying = !1);
  }
  function T() {
    l.undoDepth = r.past.length, l.redoDepth = r.future.length;
  }
  function D() {
    r.past.length && (clearTimeout(d), r.future.push(A()), b(r.past.pop()), T());
  }
  function _() {
    r.future.length && (clearTimeout(d), r.past.push(A()), b(r.future.pop()), T());
  }
  const f = () => l.undoDepth > 0, p = () => l.redoDepth > 0;
  async function y(K = null) {
    var z;
    l.loading = !0;
    try {
      if (K) {
        const H = await t.reports.get(K);
        await E(H.definition.root), l.draft = rn(H.definition, ((z = l.catalog) == null ? void 0 : z.datasets) ?? [], H), me();
      } else
        l.draft = Dt(), l.roots = (await t.query.catalog()).datasets;
      l.savedSnapshot = A(), u = l.savedSnapshot, r.past = [], r.future = [], T(), h.value && st();
    } catch (H) {
      o.error(H);
    } finally {
      l.loading = !1;
    }
  }
  async function E(K) {
    l.loadingCatalog = !0;
    try {
      l.catalog = await t.query.catalog(K);
    } finally {
      l.loadingCatalog = !1;
    }
  }
  async function x(K) {
    try {
      await E(K), Object.assign(l.draft, { root: K, rows: [], values: [], filters: { boolean: "and", items: [] }, sort: [] }), l.error = null, l.meta = null;
    } catch (z) {
      o.error(z);
    }
  }
  async function M() {
    if (!l.roots)
      try {
        l.roots = (await t.query.catalog()).datasets;
      } catch (K) {
        o.error(K);
        return;
      }
    l.draft.root = null, l.catalog = null;
  }
  function $(K) {
    for (const z of ["rows", "values"]) {
      const H = l.draft[z].findIndex((Z) => Z.uid === K);
      if (H !== -1) return { shelf: z, index: H, item: l.draft[z][H] };
    }
    return null;
  }
  function W(K, z, H = null, Z = null, X = void 0, de = null, we = null) {
    var Oe;
    const ve = a.value[K], Ae = ve && we ? { ...ve, label: we } : ve, fe = Ae == null ? void 0 : Ae.fields.find((dt) => dt.key === z);
    if (!Ae || !fe) return;
    if (X === void 0 && ((Oe = Ae.paths) == null ? void 0 : Oe.length) > 1 && K !== l.draft.root) {
      l.pathChoice = { dataset: Ae, field: fe, target: H, index: Z, parentUid: de, options: Ae.paths };
      return;
    }
    const yt = X != null && X.length ? X : null, it = H ?? (fe.role === "measure" ? "values" : "rows");
    if (it === "filters") {
      k({ target: `${K}.${z}`, type: fe.type, label: Et(l.draft, Ae, fe).baseLabel, path: yt }, de);
      return;
    }
    const $t = Et(l.draft, Ae, fe, { path: yt, asValue: it === "values" }), ut = l.draft[it];
    ut.splice(Z ?? ut.length, 0, $t);
  }
  function re(K) {
    const z = l.pathChoice;
    l.pathChoice = null, z && W(z.dataset.key, z.field.key, z.target, z.index, K, z.parentUid);
  }
  function ke(K) {
    const z = $(K);
    if (!z) return;
    const H = z.item.as;
    l.draft[z.shelf].splice(z.index, 1), l.draft.sort = l.draft.sort.filter((Z) => Z.field !== H), l.draft.filters.items = l.draft.filters.items.filter((Z) => Z.target !== H);
  }
  function le(K, z, H) {
    const Z = $(K);
    if (!Z) return;
    const { item: X } = Z;
    if (z === "rows" && X.kind === "formula") return;
    l.draft[Z.shelf].splice(Z.index, 1), z !== Z.shelf && (z === "values" ? (X.kind = "measure", X.grain = null, X.agg = X.aggregations.includes("sum") ? "sum" : X.aggregations.includes("count_distinct") ? "count_distinct" : X.aggregations[0], X.label = gt(X)) : (X.kind = "dimension", X.agg = null, X.role === "time" && (X.grain = "month"), X.label = X.baseLabel), X.as = Ut(l.draft, X.label, X));
    const de = l.draft[z];
    de.splice(Math.min(H ?? de.length, de.length), 0, X);
  }
  function L(K, z) {
    var de;
    const H = $(K);
    if (!H) return;
    const { item: Z } = H, X = Z.kind === "measure" ? Z.label === gt(Z) : Z.label === Z.baseLabel;
    Object.assign(Z, z), "agg" in z && X && (Z.label = gt(Z)), "label" in z && !((de = z.label) != null && de.trim()) && (Z.label = Z.kind === "measure" ? gt(Z) : Z.baseLabel);
  }
  function Q(K, z) {
    const H = nn(l.draft, K, z);
    return l.draft.values.push(H), H;
  }
  function I(K, z, H, Z) {
    const X = $(K);
    X && Object.assign(X.item, { label: z, formula: H }, Z !== void 0 ? { format: Z } : {});
  }
  function R(K) {
    if (!K) return l.draft.filters;
    const z = (H) => {
      for (const Z of H.items) {
        if (Z.uid === K) return Z;
        if (Z.items) {
          const X = z(Z);
          if (X) return X;
        }
      }
      return null;
    };
    return z(l.draft.filters) ?? l.draft.filters;
  }
  function k(K, z = null) {
    const H = K.op ?? Pt(K.type, K.isTotal)[0], Z = {
      uid: He(),
      target: K.target,
      type: K.type,
      label: K.label,
      isTotal: !!K.isTotal,
      path: K.path ?? null,
      op: H,
      value: K.value !== void 0 ? K.value : H === "between" && (K.type === "date" || K.type === "datetime") ? "this_month" : null
    };
    return R(z).items.push(Z), Z;
  }
  function m(K) {
    const z = $(K);
    if (!z) return;
    const H = z.item.kind === "measure" && ["count", "count_distinct"].includes(z.item.agg) ? "integer" : "decimal";
    k({ target: z.item.as, type: H, label: z.item.label, isTotal: !0 });
  }
  function S() {
    l.draft.filters.items.push({ uid: He(), boolean: l.draft.filters.boolean === "and" ? "or" : "and", items: [] });
  }
  function ee(K, z) {
    if ("op" in z && z.op !== K.op) {
      const H = ["in", "not_in", "between"].includes(K.op), Z = ["in", "not_in", "between"].includes(z.op);
      (H !== Z || z.op === "between" || K.op === "between") && (z.value = z.op === "between" && (K.type === "date" || K.type === "datetime") ? "this_month" : Z ? [] : null);
    }
    Object.assign(K, z);
  }
  function ne(K) {
    const z = (H) => {
      H.items = H.items.filter((Z) => Z.uid !== K), H.items.forEach((Z) => Z.items && z(Z));
    };
    z(l.draft.filters);
  }
  function me() {
    const K = (z) => z.items.forEach((H) => {
      if (H.items) return K(H);
      if (H.target.includes(".")) {
        const [Z, X] = H.target.split("."), de = a.value[Z], we = de == null ? void 0 : de.fields.find((ve) => ve.key === X);
        H.type = (we == null ? void 0 : we.type) ?? "string", H.label = we ? Et(l.draft, de, we).baseLabel : H.target, H.isTotal = !1;
      } else {
        const Z = [...l.draft.rows, ...l.draft.values].find((X) => X.as === H.target);
        H.label = (Z == null ? void 0 : Z.label) ?? H.target, H.isTotal = (Z == null ? void 0 : Z.kind) !== "dimension", H.type = (Z == null ? void 0 : Z.kind) === "dimension" ? Z.type : "decimal";
      }
    });
    K(l.draft.filters);
  }
  function Ce(K) {
    l.draft.sort = K;
  }
  function Ie(K) {
    const z = [...l.draft.rows, ...l.draft.values].find((Z) => Z.as === K);
    if (!z) return null;
    const H = z.kind !== "dimension";
    return {
      item: z,
      isTotal: H,
      target: H ? z.as : `${z.dataset}.${z.field}`,
      path: H ? null : z.path ?? null
    };
  }
  function Le(K, z) {
    return !K.items && K.target === z.target && JSON.stringify(K.path ?? null) === JSON.stringify(z.path);
  }
  function rt(K, z) {
    const H = Ie(K.alias);
    H && (l.draft.filters.items = l.draft.filters.items.filter((Z) => !Le(Z, H)), z && k({
      target: H.target,
      type: H.isTotal ? ["date", "datetime"].includes(K.type) ? K.type : "decimal" : H.item.type,
      label: H.isTotal ? H.item.label : H.item.baseLabel,
      path: H.path,
      isTotal: H.isTotal,
      op: z.op,
      value: z.value
    }));
  }
  function vt(K) {
    const z = Ie(K), H = z && l.draft.filters.items.find((Z) => Le(Z, z));
    return H ? { op: H.op, value: H.value } : null;
  }
  function lt(K) {
    const z = l.draft.sort.find((H) => H.field === K);
    z ? z.dir === "asc" ? l.draft.sort = [{ field: K, dir: "desc" }] : l.draft.sort = [] : l.draft.sort = [{ field: K, dir: "asc" }];
  }
  let Ne = null, ze = null;
  function Ue() {
    Ne == null || Ne.abort(), ze && t.query.cancel(ze).catch(() => {
    }), Ne = null, ze = null;
  }
  function st() {
    if (!h.value) {
      l.meta = null, l.error = null;
      return;
    }
    l.runSeq++;
  }
  async function nt({ keys: K = [], offset: z = 0, top: H = !1, size: Z = sl, fresh: X = !1 } = {}) {
    var ve, Ae;
    const de = v.value ? { columns: l.draft.rows.map((fe) => fe.as), keys: K } : void 0, we = H && (z === 0 || X);
    we && (Ue(), Ne = typeof AbortController < "u" ? new AbortController() : null, ze = cn(), l.running = !0, l.error = null, l.errorUid = null);
    try {
      const fe = await t.query.rows(g.value, {
        offset: z,
        size: Z ?? sl,
        groups: de,
        queryId: we ? ze : void 0,
        signal: Ne == null ? void 0 : Ne.signal
      });
      return H && (l.meta = { ...fe.meta, columns: fe.columns }), fe;
    } catch (fe) {
      throw ((ve = fe == null ? void 0 : fe.cause) == null ? void 0 : ve.name) === "CanceledError" || ((Ae = fe == null ? void 0 : fe.cause) == null ? void 0 : Ae.name) === "AbortError" || (H ? (l.error = fe, l.errorUid = fe.path ? ft(fe.path) : null) : o.error(fe)), fe;
    } finally {
      we && (l.running = !1, ze = null);
    }
  }
  function ft(K) {
    const { locations: z } = i.value, H = K.split(".");
    for (let Z = H.length; Z > 0; Z--) {
      const X = z[H.slice(0, Z).join(".")];
      if (X) return X;
    }
    return null;
  }
  function bt(K, z) {
    const H = $(K);
    if (H) {
      H.item.path = z;
      return;
    }
    const Z = (X) => X.items.forEach((de) => de.items ? Z(de) : de.uid === K && (de.path = z));
    Z(l.draft.filters);
  }
  let ht = null;
  ye(() => JSON.stringify(g.value), () => {
    !l.autoRun || l.loading || (clearTimeout(ht), ht = setTimeout(st, 450));
  });
  async function Ye({ name: K, description: z, folder: H, visibility: Z, copy: X = !1 } = {}) {
    const de = l.draft, we = {
      name: (K ?? de.name).trim() || "Untitled report",
      description: z ?? de.description,
      folder: (H ?? de.folder) || null,
      visibility: Z ?? de.visibility,
      definition: g.value
    };
    l.saving = !0;
    try {
      const ve = de.uuid && !X && de.canEdit ? await t.reports.update(de.uuid, we) : await t.reports.create(we);
      return Object.assign(de, {
        uuid: ve.uuid,
        name: ve.name,
        description: ve.description ?? "",
        folder: ve.folder ?? "",
        visibility: ve.visibility,
        canEdit: ve.can_edit,
        canPublish: ve.can_publish ?? !1,
        published: ve.published ?? !1
      }), l.savedSnapshot = A(), o.success(`Saved "${ve.name}".`), ve;
    } catch (ve) {
      throw o.error(ve), ve;
    } finally {
      l.saving = !1;
    }
  }
  return {
    state: l,
    definition: g,
    runnable: h,
    grouped: v,
    dirty: c,
    datasetsByKey: a,
    init: y,
    chooseRoot: x,
    changeRoot: M,
    addField: W,
    choosePath: re,
    removeItem: ke,
    moveItem: le,
    updateItem: L,
    addFormula: Q,
    updateFormula: I,
    addFilter: k,
    addFilterGroup: S,
    filterOnTotal: m,
    updateFilter: ee,
    removeFilter: ne,
    toggleSort: lt,
    setSort: Ce,
    filterColumn: rt,
    columnFilter: vt,
    run: st,
    fetchRows: nt,
    fetchSummary: () => t.query.summary(g.value),
    exportReport: async (K) => {
      try {
        const z = await t.query.export(g.value, K, { name: l.draft.name || "report" });
        o.success(`Exported "${z}".`);
      } catch (z) {
        throw o.error(z), z;
      }
    },
    gridKey: q(() => l.draft.uuid ? `report:${l.draft.uuid}` : null),
    cancelRunning: Ue,
    applyPath: bt,
    save: Ye,
    undo: D,
    redo: _,
    canUndo: f,
    canRedo: p,
    ROW_COUNT: Vt
  };
}
const Ee = Symbol("rg-report-builder");
let mn = 1;
function St() {
  const t = be([]);
  function o(r, i, g = r === "error" ? 7e3 : 3500) {
    const h = mn++;
    t.push({ id: h, kind: r, message: i }), setTimeout(() => l(h), g);
  }
  function l(r) {
    const i = t.findIndex((g) => g.id === r);
    i !== -1 && t.splice(i, 1);
  }
  return {
    items: t,
    dismiss: l,
    success: (r) => o("success", r),
    error: (r) => o("error", typeof r == "string" ? r : (r == null ? void 0 : r.message) || "Something went wrong.")
  };
}
const pn = ["onClick"], Mt = {
  __name: "RgToaster",
  props: { toasts: { type: Object, required: !0 } },
  setup(t) {
    return (o, l) => (s(), ae(ul, { to: "body" }, [
      e("div", dl({ class: "rg-root rg-toaster" }, o.$attrs, {
        role: "status",
        "aria-live": "polite"
      }), [
        O(je, { name: "rg-toast" }, {
          default: ue(() => [
            (s(!0), n(j, null, G(t.toasts.items, (r) => (s(), n("div", {
              key: r.id,
              class: oe(["rg-toast", `rg-toast--${r.kind}`])
            }, [
              O(P, {
                name: r.kind === "error" ? "alert" : "check"
              }, null, 8, ["name"]),
              e("p", null, w(r.message), 1),
              e("button", {
                type: "button",
                class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
                "aria-label": "Dismiss",
                onClick: (i) => t.toasts.dismiss(r.id)
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
  setup(t, { emit: o }) {
    const l = o, r = B(null);
    function i(h) {
      var a;
      r.value && !((a = r.value.parentElement) != null && a.contains(h.target)) && l("close");
    }
    function g(h) {
      h.key === "Escape" && l("close");
    }
    return Me(() => {
      var h, a;
      setTimeout(() => document.addEventListener("mousedown", i), 0), document.addEventListener("keydown", g), (a = (h = r.value) == null ? void 0 : h.querySelector("input, select, textarea, button")) == null || a.focus();
    }), Fe(() => {
      document.removeEventListener("mousedown", i), document.removeEventListener("keydown", g);
    }), (h, a) => (s(), n("div", {
      ref_key: "panel",
      ref: r,
      class: "rg-pop",
      role: "dialog",
      onClick: a[0] || (a[0] = ge(() => {
      }, ["stop"]))
    }, [
      pt(h.$slots, "default")
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
    const o = t, l = B(!1), r = B(null), i = B(null);
    async function g(h) {
      l.value = !1, r.value = h, i.value = null;
      try {
        await o.run(h);
      } catch (a) {
        i.value = (a == null ? void 0 : a.message) ?? "Export failed.";
      } finally {
        r.value = null;
      }
    }
    return (h, a) => (s(), n("div", vn, [
      e("button", {
        type: "button",
        class: oe(["rg-btn rg-btn--export", { "rg-btn--sm": t.small }]),
        disabled: t.disabled || !!r.value,
        "aria-expanded": l.value,
        "aria-haspopup": "menu",
        onClick: a[0] || (a[0] = (v) => l.value = !l.value)
      }, [
        O(P, {
          name: r.value ? "loader" : "download",
          spin: !!r.value,
          small: ""
        }, null, 8, ["name", "spin"]),
        N(" " + w(r.value ? `Exporting ${r.value === "xlsx" ? "Excel" : "CSV"}…` : "Export") + " ", 1),
        r.value ? C("", !0) : (s(), ae(P, {
          key: 0,
          name: "chevron",
          small: "",
          class: "rg-export__chev"
        }))
      ], 10, fn),
      l.value ? (s(), ae(ot, {
        key: 0,
        class: "rg-export__menu",
        onClose: a[3] || (a[3] = (v) => l.value = !1)
      }, {
        default: ue(() => [
          e("button", {
            type: "button",
            role: "menuitem",
            class: "rg-export__item",
            onClick: a[1] || (a[1] = (v) => g("xlsx"))
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
            onClick: a[2] || (a[2] = (v) => g("csv"))
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
      })) : C("", !0),
      i.value ? (s(), n("p", yn, w(i.value), 1)) : C("", !0)
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
  setup(t, { emit: o }) {
    const l = o, r = $e(Ee), i = q(() => r.state.draft), g = q(() => {
      var h;
      return ((h = r.datasetsByKey.value[i.value.root]) == null ? void 0 : h.label) ?? i.value.root;
    });
    return (h, a) => (s(), n("header", $n, [
      e("div", _n, [
        a[13] || (a[13] = e("label", {
          class: "rg-sr-only",
          for: "rg-report-name"
        }, "Report name", -1)),
        se(e("input", {
          id: "rg-report-name",
          "onUpdate:modelValue": a[0] || (a[0] = (v) => i.value.name = v),
          class: "rg-input rg-input--bare rg-name-input",
          maxlength: "255"
        }, null, 512), [
          [ce, i.value.name]
        ]),
        e("div", kn, [
          i.value.root ? (s(), n("span", wn, [
            a[10] || (a[10] = N(" Report on ", -1)),
            e("b", null, w(g.value), 1),
            e("button", {
              type: "button",
              onClick: a[1] || (a[1] = (v) => F(r).changeRoot())
            }, "change")
          ])) : C("", !0),
          F(r).dirty.value ? (s(), n("span", xn, [...a[11] || (a[11] = [
            e("i", {
              class: "rg-dot",
              "aria-hidden": "true"
            }, null, -1),
            N(" Unsaved changes", -1)
          ])])) : C("", !0),
          i.value.uuid && !i.value.canEdit ? (s(), n("span", Cn, "View only: save a copy to keep changes")) : C("", !0),
          i.value.published ? (s(), n("span", Sn, [
            O(P, {
              name: "globe",
              small: ""
            }),
            a[12] || (a[12] = N(" Published", -1))
          ])) : C("", !0)
        ])
      ]),
      e("div", Mn, [
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--ghost rg-btn--icon",
          disabled: !F(r).canUndo(),
          "aria-label": "Undo",
          title: "Undo (Ctrl+Z)",
          onClick: a[2] || (a[2] = (v) => F(r).undo())
        }, [
          O(P, { name: "undo" })
        ], 8, Tn),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--ghost rg-btn--icon",
          disabled: !F(r).canRedo(),
          "aria-label": "Redo",
          title: "Redo (Ctrl+Shift+Z)",
          onClick: a[3] || (a[3] = (v) => F(r).redo())
        }, [
          O(P, { name: "redo" })
        ], 8, En),
        a[19] || (a[19] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
        e("label", An, [
          se(e("input", {
            id: "rg-autorun",
            "onUpdate:modelValue": a[4] || (a[4] = (v) => F(r).state.autoRun = v),
            class: "rg-check",
            type: "checkbox"
          }, null, 512), [
            [mt, F(r).state.autoRun]
          ]),
          a[14] || (a[14] = N(" Auto-run ", -1))
        ]),
        e("button", {
          type: "button",
          class: "rg-btn",
          disabled: !F(r).runnable.value || F(r).state.running,
          title: "Run (Ctrl+Enter)",
          onClick: a[5] || (a[5] = (v) => F(r).run())
        }, [
          O(P, {
            name: "play",
            small: ""
          }),
          a[15] || (a[15] = N(" Run ", -1))
        ], 8, On),
        O(It, {
          run: F(r).exportReport,
          disabled: !F(r).runnable.value
        }, null, 8, ["run", "disabled"]),
        a[20] || (a[20] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
        i.value.uuid ? (s(), n("button", {
          key: 0,
          type: "button",
          class: "rg-btn",
          title: "Add a chart or number from this report to a dashboard",
          onClick: a[6] || (a[6] = (v) => l("pin"))
        }, [
          O(P, {
            name: "plus",
            small: ""
          }),
          a[16] || (a[16] = N(" Pin ", -1))
        ])) : C("", !0),
        i.value.uuid && i.value.canPublish ? (s(), n("button", {
          key: 1,
          type: "button",
          class: "rg-btn",
          title: "Give roles a permission to open this report",
          onClick: a[7] || (a[7] = (v) => l("publish"))
        }, [
          O(P, {
            name: "globe",
            small: ""
          }),
          N(" " + w(i.value.published ? "Publishing" : "Publish"), 1)
        ])) : C("", !0),
        i.value.uuid ? (s(), n("button", {
          key: 2,
          type: "button",
          class: "rg-btn",
          disabled: !i.value.root,
          onClick: a[8] || (a[8] = (v) => l("save-copy"))
        }, [
          O(P, {
            name: "copy",
            small: ""
          }),
          a[17] || (a[17] = N(" Save a copy ", -1))
        ], 8, Rn)) : C("", !0),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          disabled: !F(r).runnable.value || F(r).state.saving || i.value.uuid && !i.value.canEdit,
          title: "Save (Ctrl+S)",
          onClick: a[9] || (a[9] = (v) => l("save"))
        }, [
          O(P, {
            name: "save",
            small: ""
          }),
          a[18] || (a[18] = N(" Save ", -1))
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
}, Gn = {
  __name: "RootPicker",
  setup(t) {
    const o = $e(Ee), l = $e("rg-start-combined", null), r = $e("rg-choose-combined", null), i = B(""), g = B(null), h = { period: "Period", line: "Line", division: "Division", employee: "Employee" }, a = q(() => {
      const d = /* @__PURE__ */ new Map();
      for (const u of o.state.roots ?? []) {
        const b = u.group ?? u.label;
        d.has(b) || d.set(b, []), d.get(b).push(u);
      }
      return [...d].map(([u, b]) => ({ name: u, topics: b }));
    }), v = q(() => {
      var d;
      return g.value ?? ((d = a.value[0]) == null ? void 0 : d.name) ?? null;
    }), A = q(() => {
      var u;
      const d = i.value.trim().toLowerCase();
      return d || a.value.length < 2 ? (o.state.roots ?? []).filter((b) => !d || b.label.toLowerCase().includes(d) || b.key.includes(d)) : ((u = a.value.find((b) => b.name === v.value)) == null ? void 0 : u.topics) ?? [];
    });
    function c(d) {
      return Object.entries(d.filters ?? {}).filter(([, u]) => u).map(([u]) => h[u] ?? u);
    }
    return (d, u) => (s(), n("div", Nn, [
      u[5] || (u[5] = e("div", null, [
        e("h2", null, "What is this report about?"),
        e("p", {
          class: "rg-muted",
          style: { margin: "4px 0 0" }
        }, " Pick the main topic: each row of a detailed report is one of these. Fields from related topics can be added next. ")
      ], -1)),
      e("div", Vn, [
        a.value.length > 1 && !i.value ? (s(), n("nav", Fn, [
          (s(!0), n(j, null, G(a.value, (b) => (s(), n("button", {
            key: b.name,
            type: "button",
            role: "tab",
            class: "rg-topics__tab",
            "aria-selected": v.value === b.name,
            onClick: (T) => g.value = b.name
          }, [
            N(w(b.name), 1),
            e("span", Un, w(b.topics.length), 1)
          ], 8, Pn))), 128))
        ])) : C("", !0),
        e("label", In, [
          u[2] || (u[2] = e("span", { class: "rg-sr-only" }, "Search topics", -1)),
          O(P, { name: "search" }),
          se(e("input", {
            id: "rg-root-search",
            "onUpdate:modelValue": u[0] || (u[0] = (b) => i.value = b),
            class: "rg-input",
            type: "search",
            placeholder: "Search topics",
            autocomplete: "off"
          }, null, 512), [
            [ce, i.value]
          ])
        ])
      ]),
      F(l) && F(r) && !i.value ? (s(), n("button", {
        key: 0,
        type: "button",
        class: "rg-root-card rg-root-card--combine",
        onClick: u[1] || (u[1] = (b) => F(r)())
      }, [
        e("b", null, [
          O(P, {
            name: "table",
            small: ""
          }),
          u[3] || (u[3] = N(" Combine existing reports", -1))
        ]),
        u[4] || (u[4] = e("span", null, "Put columns of reports you already use side by side, one row per employee or per division, and add formulas across them.", -1))
      ])) : C("", !0),
      O(je, {
        tag: "div",
        name: "rg-list-fade",
        class: "rg-roots__grid"
      }, {
        default: ue(() => [
          (s(!0), n(j, null, G(A.value, (b) => (s(), n("button", {
            key: b.key,
            type: "button",
            class: "rg-root-card",
            onClick: (T) => F(o).chooseRoot(b.key)
          }, [
            e("b", null, w(b.label), 1),
            b.description ? (s(), n("span", jn, w(b.description), 1)) : C("", !0),
            e("span", zn, [
              N(w(b.fields_count) + " fields", 1),
              c(b).length ? (s(), n(j, { key: 0 }, [
                N(" · by " + w(c(b).join(", ")), 1)
              ], 64)) : C("", !0)
            ])
          ], 8, qn))), 128))
        ]),
        _: 1
      }),
      F(o).state.roots && !A.value.length ? (s(), n("p", Bn, w(i.value ? "No topic matches your search." : "There are no topics you can report on yet. Ask an admin for access."), 1)) : C("", !0)
    ]));
  }
}, Kn = ["aria-expanded"], Hn = { class: "rg-ds__name" }, Wn = {
  key: 0,
  class: "rg-faint"
}, Yn = { class: "rg-ds__meta" }, Jn = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, Qn = {
  key: 1,
  class: "rg-badge",
  title: "Several per report row: totals are counted once per row"
}, Zn = {
  key: 0,
  class: "rg-ds__fields"
}, Xn = ["title", "onDragstart", "onDblclick"], ea = { class: "rg-fld__label" }, ta = { class: "rg-fld__actions" }, la = ["aria-label", "onClick"], sa = ["aria-label", "onClick"], na = /* @__PURE__ */ Object.assign({ name: "FieldNode" }, {
  __name: "FieldNode",
  props: {
    node: { type: Object, required: !0 },
    depth: { type: Number, default: 0 },
    /** Labels of the nodes above, for names like "Employee › Line". */
    trail: { type: Array, default: () => [] },
    search: { type: String, default: "" },
    open: { type: Object, required: !0 }
  },
  setup(t) {
    const o = t, l = $e(Ee), r = q(() => (o.node.path ? o.node.path.join(".") : o.node.topic) || "root"), i = q(() => o.depth === 0), g = q(() => [...o.trail, o.node.label].join(" › ")), h = q(() => o.search.trim().toLowerCase());
    function a(f, p) {
      return h.value ? [...p, f.label].join(" ").toLowerCase().includes(h.value) || f.fields.some((E) => !E.hidden && E.label.toLowerCase().includes(h.value)) || (f.relations ?? []).some((E) => a(E, [...p, f.label])) : !0;
    }
    const v = q(() => o.node.fields.filter((f) => !f.hidden)), A = q(() => !h.value || g.value.toLowerCase().includes(h.value) ? v.value : v.value.filter((f) => f.label.toLowerCase().includes(h.value))), c = q(() => (o.node.relations ?? []).filter((f) => a(f, i.value ? [] : [...o.trail, o.node.label]))), d = q(() => h.value ? !0 : o.open[r.value] ?? i.value), u = q(() => i.value ? [] : [...o.trail, o.node.label]);
    function b() {
      o.open[r.value] = !d.value;
    }
    const T = q(() => i.value ? null : g.value);
    function D(f, p = null) {
      l.addField(o.node.topic, f.key, p, null, o.node.path, null, T.value);
    }
    function _(f, p) {
      f.dataTransfer.effectAllowed = "copy", f.dataTransfer.setData("application/x-rg", JSON.stringify({
        kind: "field",
        dataset: o.node.topic,
        field: p.key,
        path: o.node.path,
        label: T.value
      })), f.dataTransfer.setData("text/plain", p.label);
    }
    return (f, p) => {
      const y = cl("FieldNode", !0);
      return s(), n("section", {
        class: oe(["rg-ds", { "rg-ds--nested": t.depth > 0 }]),
        style: Se({ "--rg-depth": t.depth })
      }, [
        e("button", {
          type: "button",
          class: "rg-ds__head",
          "aria-expanded": d.value ? "true" : "false",
          onClick: b
        }, [
          O(P, {
            name: "chevron",
            small: "",
            class: "rg-chev"
          }),
          e("span", Hn, [
            N(w(t.node.label) + " ", 1),
            t.node.topic_label && t.node.topic_label !== t.node.label && !i.value ? (s(), n("small", Wn, w(t.node.topic_label), 1)) : C("", !0)
          ]),
          e("span", Yn, [
            i.value ? (s(), n("span", Jn, "report")) : t.node.multiplies_rows ? (s(), n("span", Qn, "many")) : C("", !0)
          ])
        ], 8, Kn),
        d.value ? (s(), n(j, { key: 0 }, [
          A.value.length ? (s(), n("ul", Zn, [
            (s(!0), n(j, null, G(A.value, (E) => (s(), n("li", {
              key: E.key,
              class: "rg-fld",
              draggable: "true",
              title: `${g.value} · ${E.label} (${E.type})`,
              onDragstart: (x) => _(x, E),
              onDblclick: (x) => D(E)
            }, [
              e("span", {
                class: oe(`rg-role rg-role--${E.role}`)
              }, [
                O(P, {
                  name: E.key === "__rows" ? "hash" : F(Nt)[E.type] || "text",
                  small: "",
                  class: "rg-fld__icon"
                }, null, 8, ["name"])
              ], 2),
              e("span", ea, w(E.label), 1),
              e("span", ta, [
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
                  "aria-label": `Add ${E.label}`,
                  title: "Add",
                  onClick: (x) => D(E)
                }, [
                  O(P, {
                    name: "plus",
                    small: ""
                  })
                ], 8, la),
                E.key !== "__rows" ? (s(), n("button", {
                  key: 0,
                  type: "button",
                  class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
                  "aria-label": `Filter by ${E.label}`,
                  title: "Filter by this",
                  onClick: (x) => D(E, "filters")
                }, [
                  O(P, {
                    name: "filter",
                    small: ""
                  })
                ], 8, sa)) : C("", !0)
              ])
            ], 40, Xn))), 128))
          ])) : C("", !0),
          (s(!0), n(j, null, G(c.value, (E) => (s(), ae(y, {
            key: E.path ? E.path.join(".") : E.topic,
            node: E,
            depth: t.depth + 1,
            trail: u.value,
            search: t.search,
            open: t.open
          }, null, 8, ["node", "depth", "trail", "search", "open"]))), 128))
        ], 64)) : C("", !0)
      ], 6);
    };
  }
}), aa = {
  class: "rg-explorer",
  "aria-label": "Fields"
}, oa = { class: "rg-explorer__head" }, ra = { class: "rg-search" }, ia = { class: "rg-explorer__list" }, ua = {
  key: 1,
  class: "rg-skeleton-list"
}, da = {
  __name: "FieldExplorer",
  setup(t) {
    const o = $e(Ee), l = B(""), r = be({});
    function i(h, a) {
      const v = h.find((c) => c.key === a);
      if (!v) return null;
      const A = (c) => {
        var d;
        return {
          name: c.key,
          label: c.label,
          topic: c.key,
          topic_label: c.label,
          path: c.key === a ? [] : ((d = c.paths) == null ? void 0 : d.length) === 1 ? c.paths[0].path : void 0,
          multiplies_rows: (c.paths ?? []).some((u) => u.multiplies_rows),
          fields: c.fields,
          relations: []
        };
      };
      return { ...A(v), relations: h.filter((c) => c.key !== a).map(A) };
    }
    const g = q(() => {
      var h, a;
      return ((h = o.state.catalog) == null ? void 0 : h.tree) ?? i(((a = o.state.catalog) == null ? void 0 : a.datasets) ?? [], o.state.draft.root);
    });
    return (h, a) => (s(), n("aside", aa, [
      e("div", oa, [
        e("label", ra, [
          a[1] || (a[1] = e("span", { class: "rg-sr-only" }, "Search fields", -1)),
          O(P, { name: "search" }),
          se(e("input", {
            id: "rg-field-search",
            "onUpdate:modelValue": a[0] || (a[0] = (v) => l.value = v),
            class: "rg-input",
            type: "search",
            placeholder: "Search fields",
            autocomplete: "off"
          }, null, 512), [
            [ce, l.value]
          ])
        ]),
        a[2] || (a[2] = e("span", { class: "rg-explorer__hint" }, "Drag fields onto Rows, Values or Filters, or double-click to add.", -1))
      ]),
      e("div", ia, [
        g.value ? (s(), ae(na, {
          key: 0,
          node: g.value,
          search: l.value,
          open: r
        }, null, 8, ["node", "search", "open"])) : (s(), n("div", ua, [
          (s(), n(j, null, G(6, (v) => e("div", {
            key: v,
            class: "rg-skeleton"
          })), 64))
        ]))
      ])
    ]));
  }
}, ca = { class: "rg-chip-wrap" }, ga = ["aria-label", "title"], ma = { class: "rg-chip__label" }, pa = {
  key: 1,
  class: "rg-chip__tag"
}, va = ["aria-label"], fa = ["for"], ba = ["id", "value"], ha = ["for"], ya = ["id", "value"], $a = ["value"], _a = ["for"], ka = ["id", "value"], wa = ["value"], xa = ["for"], Ca = ["id", "value"], Sa = {
  key: 3,
  class: "rg-faint",
  style: { margin: "0", "font-size": "11.5px" }
}, Ma = { class: "rg-pop__foot" }, Ta = { class: "rg-pop__row" }, Ea = {
  __name: "FieldChip",
  props: {
    item: { type: Object, required: !0 },
    shelf: { type: String, required: !0 }
  },
  emits: ["edit-formula"],
  setup(t, { emit: o }) {
    const l = t, r = o, i = $e(Ee), g = B(!1), h = B(!1), a = [
      [null, "Exact value"],
      ["day", "Day"],
      ["week", "Week"],
      ["month", "Month"],
      ["quarter", "Quarter"],
      ["year", "Year"],
      ["month_of_year", "Month of year"],
      ["day_of_week", "Day of week"]
    ], v = q(() => ["date", "datetime"].includes(l.item.type)), A = q(() => l.item.kind === "formula" ? "rg-chip--formula" : `rg-role rg-role--${l.item.kind === "measure" ? "measure" : l.item.role === "time" ? "time" : "dimension"}`), c = q(() => {
      var _;
      return l.item.kind === "formula" ? "fx" : l.item.kind === "measure" ? l.item.field === "__rows" ? "#" : xt[l.item.agg] : l.item.grain ? (_ = a.find(([f]) => f === l.item.grain)) == null ? void 0 : _[1] : "";
    }), d = q(() => i.state.errorUid === l.item.uid);
    function u(_) {
      h.value = !0, _.dataTransfer.effectAllowed = "move", _.dataTransfer.setData("application/x-rg", JSON.stringify({ kind: "item", uid: l.item.uid })), _.dataTransfer.setData("text/plain", l.item.label);
    }
    function b(_) {
      i.updateItem(l.item.uid, _);
    }
    function T(_) {
      i.moveItem(l.item.uid, _), g.value = !1;
    }
    function D(_) {
      const p = i.state.draft[l.shelf].findIndex((y) => y.uid === l.item.uid);
      i.moveItem(l.item.uid, l.shelf, Math.max(0, p + _));
    }
    return (_, f) => (s(), n("div", ca, [
      e("span", {
        class: oe(["rg-chip", [A.value, { "rg-chip--error": d.value, "rg-chip--dragging": h.value }]]),
        draggable: "true",
        role: "button",
        tabindex: "0",
        "aria-label": `${t.item.label}: open options`,
        title: t.item.missing ? "This field is no longer in the data model" : t.item.label,
        onDragstart: u,
        onDragend: f[1] || (f[1] = (p) => h.value = !1),
        onClick: f[2] || (f[2] = (p) => g.value = !g.value),
        onKeydown: [
          f[3] || (f[3] = Ke(ge((p) => g.value = !g.value, ["prevent"]), ["enter"])),
          f[4] || (f[4] = Ke((p) => F(i).removeItem(t.item.uid), ["delete"])),
          f[5] || (f[5] = Ke(ge((p) => D(-1), ["alt", "prevent"]), ["left"])),
          f[6] || (f[6] = Ke(ge((p) => D(1), ["alt", "prevent"]), ["right"]))
        ]
      }, [
        t.item.missing ? (s(), ae(P, {
          key: 0,
          name: "alert",
          small: ""
        })) : C("", !0),
        e("span", ma, w(t.item.label), 1),
        c.value ? (s(), n("span", pa, w(c.value), 1)) : C("", !0),
        e("button", {
          type: "button",
          class: "rg-chip__x",
          "aria-label": `Remove ${t.item.label}`,
          onClick: f[0] || (f[0] = ge((p) => F(i).removeItem(t.item.uid), ["stop"]))
        }, [
          O(P, {
            name: "x",
            small: ""
          })
        ], 8, va)
      ], 42, ga),
      g.value ? (s(), ae(ot, {
        key: 0,
        onClose: f[16] || (f[16] = (p) => g.value = !1)
      }, {
        default: ue(() => [
          e("label", {
            for: `rg-chip-label-${t.item.uid}`
          }, [
            f[17] || (f[17] = N(" Column name ", -1)),
            e("input", {
              id: `rg-chip-label-${t.item.uid}`,
              class: "rg-input",
              value: t.item.label,
              maxlength: "120",
              onChange: f[7] || (f[7] = (p) => b({ label: p.target.value }))
            }, null, 40, ba)
          ], 8, fa),
          t.item.kind === "measure" && t.item.field !== "__rows" ? (s(), n("label", {
            key: 0,
            for: `rg-chip-agg-${t.item.uid}`
          }, [
            f[18] || (f[18] = N(" Calculate ", -1)),
            e("select", {
              id: `rg-chip-agg-${t.item.uid}`,
              class: "rg-select",
              value: t.item.agg,
              onChange: f[8] || (f[8] = (p) => b({ agg: p.target.value }))
            }, [
              (s(!0), n(j, null, G(t.item.aggregations, (p) => (s(), n("option", {
                key: p,
                value: p
              }, w(F(xt)[p]), 9, $a))), 128))
            ], 40, ya)
          ], 8, ha)) : C("", !0),
          t.item.kind === "dimension" && v.value ? (s(), n("label", {
            key: 1,
            for: `rg-chip-grain-${t.item.uid}`
          }, [
            f[19] || (f[19] = N(" Group dates by ", -1)),
            e("select", {
              id: `rg-chip-grain-${t.item.uid}`,
              class: "rg-select",
              value: t.item.grain ?? "",
              onChange: f[9] || (f[9] = (p) => b({ grain: p.target.value || null }))
            }, [
              (s(), n(j, null, G(a, ([p, y]) => e("option", {
                key: y,
                value: p ?? ""
              }, w(y), 9, wa)), 64))
            ], 40, ka)
          ], 8, _a)) : C("", !0),
          t.item.kind !== "dimension" ? (s(), n("label", {
            key: 2,
            for: `rg-chip-format-${t.item.uid}`
          }, [
            f[20] || (f[20] = N(" Number format ", -1)),
            e("input", {
              id: `rg-chip-format-${t.item.uid}`,
              class: "rg-input rg-mono",
              value: t.item.format ?? "",
              placeholder: "#,##0.00 or 0.0%",
              maxlength: "64",
              onChange: f[10] || (f[10] = (p) => b({ format: p.target.value || null }))
            }, null, 40, Ca)
          ], 8, xa)) : C("", !0),
          t.item.path ? (s(), n("p", Sa, "Uses a chosen join path.")) : C("", !0),
          e("div", Ma, [
            e("div", Ta, [
              t.item.kind === "formula" ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: f[11] || (f[11] = (p) => {
                  r("edit-formula", t.item), g.value = !1;
                })
              }, [
                O(P, {
                  name: "fx",
                  small: ""
                }),
                f[21] || (f[21] = N(" Edit formula ", -1))
              ])) : C("", !0),
              t.item.kind !== "dimension" ? (s(), n("button", {
                key: 1,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: f[12] || (f[12] = (p) => {
                  F(i).filterOnTotal(t.item.uid), g.value = !1;
                })
              }, [
                O(P, {
                  name: "filter",
                  small: ""
                }),
                f[22] || (f[22] = N(" Filter on this ", -1))
              ])) : C("", !0),
              t.shelf === "values" && t.item.kind === "measure" && t.item.field !== "__rows" ? (s(), n("button", {
                key: 2,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: f[13] || (f[13] = (p) => T("rows"))
              }, "Move to Rows")) : C("", !0),
              t.shelf === "rows" ? (s(), n("button", {
                key: 3,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: f[14] || (f[14] = (p) => T("values"))
              }, "Move to Values")) : C("", !0)
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--danger rg-btn--ghost",
              onClick: f[15] || (f[15] = (p) => F(i).removeItem(t.item.uid))
            }, "Remove")
          ])
        ]),
        _: 1
      })) : C("", !0)
    ]));
  }
}, Aa = { class: "rg-shelf" }, Oa = { class: "rg-shelf__title" }, Ra = ["aria-label"], Da = {
  key: 0,
  class: "rg-drop-marker"
}, La = {
  key: 0,
  class: "rg-drop-marker"
}, Na = {
  key: 1,
  class: "rg-shelf__empty"
}, nl = {
  __name: "ShelfDrop",
  props: {
    shelf: { type: String, required: !0 },
    title: { type: String, required: !0 },
    empty: { type: String, required: !0 }
  },
  emits: ["edit-formula"],
  setup(t, { emit: o }) {
    const l = t, r = o, i = $e(Ee), g = B(!1), h = B(null), a = B(null);
    function v(u) {
      try {
        return JSON.parse(u.dataTransfer.getData("application/x-rg"));
      } catch {
        return null;
      }
    }
    function A(u) {
      var D;
      const b = [...((D = a.value) == null ? void 0 : D.querySelectorAll(".rg-chip-wrap")) ?? []], T = getComputedStyle(a.value).direction === "rtl";
      for (let _ = 0; _ < b.length; _++) {
        const f = b[_].getBoundingClientRect(), p = f.left + f.width / 2, y = T ? u.clientX > p : u.clientX < p;
        if (u.clientY < f.bottom && y) return _;
      }
      return b.length;
    }
    function c(u) {
      [...u.dataTransfer.types].includes("application/x-rg") && (u.preventDefault(), g.value = !0, h.value = A(u));
    }
    function d(u) {
      const b = v(u), T = h.value;
      g.value = !1, h.value = null, b && (b.kind === "field" && i.addField(b.dataset, b.field, l.shelf, T, b.path, null, b.label), b.kind === "item" && i.moveItem(b.uid, l.shelf, T));
    }
    return (u, b) => (s(), n("div", Aa, [
      e("span", Oa, w(t.title), 1),
      e("div", {
        ref_key: "zone",
        ref: a,
        class: oe(["rg-shelf__drop", { "rg-shelf__drop--over": g.value }]),
        "aria-label": `${t.title} shelf`,
        onDragover: c,
        onDragleave: b[1] || (b[1] = ge((T) => {
          g.value = !1, h.value = null;
        }, ["self"])),
        onDrop: ge(d, ["prevent"])
      }, [
        (s(!0), n(j, null, G(F(i).state.draft[t.shelf], (T, D) => (s(), n(j, {
          key: T.uid
        }, [
          g.value && h.value === D ? (s(), n("span", Da)) : C("", !0),
          O(Ea, {
            item: T,
            shelf: t.shelf,
            onEditFormula: b[0] || (b[0] = (_) => r("edit-formula", _))
          }, null, 8, ["item", "shelf"])
        ], 64))), 128)),
        g.value && h.value === F(i).state.draft[t.shelf].length ? (s(), n("span", La)) : C("", !0),
        !F(i).state.draft[t.shelf].length && !g.value ? (s(), n("span", Na, w(t.empty), 1)) : C("", !0),
        pt(u.$slots, "default")
      ], 42, Ra)
    ]));
  }
}, Va = ["aria-label", "onClick"], Fa = ["id", "inputmode", "placeholder"], Pa = {
  key: 0,
  class: "rg-suggest",
  role: "listbox"
}, Ua = ["onMousedown"], Ia = {
  __name: "ValueListInput",
  props: {
    modelValue: { type: Array, default: () => [] },
    field: { type: String, default: null },
    // dataset.field, null for free text
    numeric: { type: Boolean, default: !1 },
    inputId: { type: String, required: !0 }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: o }) {
    const l = t, r = o, { api: i } = Pe(), g = B(""), h = B([]), a = B(!1);
    let v = null, A = 0;
    function c(T) {
      const D = l.numeric ? Number(T) : String(T).trim();
      D === "" || l.numeric && Number.isNaN(D) || (l.modelValue.includes(D) || r("update:modelValue", [...l.modelValue, D]), g.value = "", a.value = !1);
    }
    function d(T) {
      r("update:modelValue", l.modelValue.filter((D) => D !== T));
    }
    ye(g, (T) => {
      clearTimeout(v), l.field && (v = setTimeout(async () => {
        const D = ++A;
        try {
          const _ = await i.query.values(l.field, T, 30);
          D === A && (h.value = _.filter((f) => !l.modelValue.includes(f)), a.value = !0);
        } catch {
          h.value = [];
        }
      }, 250));
    }), Fe(() => clearTimeout(v));
    function u() {
      setTimeout(() => a.value = !1, 150);
    }
    function b(T) {
      T.key === "Enter" || T.key === "," ? (T.preventDefault(), c(g.value)) : T.key === "Backspace" && !g.value && l.modelValue.length ? d(l.modelValue[l.modelValue.length - 1]) : T.key === "Escape" && (a.value = !1);
    }
    return (T, D) => (s(), n("span", {
      class: "rg-tags",
      onClick: D[2] || (D[2] = (_) => {
        var f;
        return (f = _.currentTarget.querySelector("input")) == null ? void 0 : f.focus();
      })
    }, [
      (s(!0), n(j, null, G(t.modelValue, (_) => (s(), n("span", {
        key: String(_),
        class: "rg-tag"
      }, [
        N(w(_) + " ", 1),
        e("button", {
          type: "button",
          "aria-label": `Remove ${_}`,
          onClick: ge((f) => d(_), ["stop"])
        }, "×", 8, Va)
      ]))), 128)),
      se(e("input", {
        id: t.inputId,
        "onUpdate:modelValue": D[0] || (D[0] = (_) => g.value = _),
        inputmode: t.numeric ? "decimal" : "text",
        placeholder: t.modelValue.length ? "" : t.field ? "Type to search" : "Type and press Enter",
        autocomplete: "off",
        onKeydown: b,
        onFocus: D[1] || (D[1] = (_) => t.field && (g.value = g.value)),
        onBlur: u
      }, null, 40, Fa), [
        [ce, g.value]
      ]),
      a.value && h.value.length ? (s(), n("ul", Pa, [
        (s(!0), n(j, null, G(h.value, (_) => (s(), n("li", {
          key: String(_)
        }, [
          e("button", {
            type: "button",
            role: "option",
            onMousedown: ge((f) => c(_), ["prevent"])
          }, w(_), 41, Ua)
        ]))), 128))
      ])) : C("", !0)
    ]));
  }
}, qa = ["id", "value"], ja = ["id", "value"], za = ["value"], Ba = ["id", "value"], Ga = ["id", "value"], Ka = ["id", "type", "value"], Ha = ["id", "type", "value"], Wa = ["id", "type", "value"], Ya = {
  __name: "FilterValue",
  props: { node: { type: Object, required: !0 } },
  emits: ["update"],
  setup(t, { emit: o }) {
    const l = t, r = o, i = q(() => ["date", "datetime"].includes(l.node.type)), g = q(() => ["integer", "decimal"].includes(l.node.type) || l.node.isTotal), h = q(() => i.value ? "date" : g.value ? "number" : "text"), a = q(() => typeof l.node.value == "string" && tl.some(([u]) => u === l.node.value)), v = (u) => `rg-filter-${l.node.uid}-${u}`;
    function A(u) {
      r("update", { value: u });
    }
    function c(u, b) {
      const T = Array.isArray(l.node.value) ? [...l.node.value] : ["", ""];
      T[u] = g.value && b !== "" ? Number(b) : b, A(T);
    }
    function d(u) {
      A(g.value && u !== "" ? Number(u) : u);
    }
    return (u, b) => {
      var T, D, _, f;
      return ["is_null", "not_null"].includes(t.node.op) ? (s(), n(j, { key: 0 }, [], 64)) : t.node.type === "boolean" ? (s(), n("select", {
        key: 1,
        id: v("bool"),
        class: "rg-select",
        value: t.node.value === null ? "" : String(t.node.value),
        "aria-label": "Value",
        onChange: b[0] || (b[0] = (p) => A(p.target.value === "true"))
      }, [...b[7] || (b[7] = [
        e("option", {
          value: "",
          disabled: ""
        }, "Choose", -1),
        e("option", { value: "true" }, "Yes", -1),
        e("option", { value: "false" }, "No", -1)
      ])], 40, qa)) : t.node.op === "between" && i.value ? (s(), n(j, { key: 2 }, [
        e("select", {
          id: v("preset"),
          class: "rg-select",
          value: a.value ? t.node.value : "custom",
          "aria-label": "Date range",
          onChange: b[1] || (b[1] = (p) => A(p.target.value === "custom" ? ["", ""] : p.target.value))
        }, [
          (s(!0), n(j, null, G(F(tl), ([p, y]) => (s(), n("option", {
            key: p,
            value: p
          }, w(y), 9, za))), 128)),
          b[8] || (b[8] = e("option", { value: "custom" }, "Custom range…", -1))
        ], 40, ja),
        a.value ? C("", !0) : (s(), n(j, { key: 0 }, [
          e("input", {
            id: v("from"),
            class: "rg-input",
            type: "date",
            "aria-label": "From",
            value: ((T = t.node.value) == null ? void 0 : T[0]) ?? "",
            onChange: b[2] || (b[2] = (p) => c(0, p.target.value))
          }, null, 40, Ba),
          b[9] || (b[9] = e("span", { class: "rg-faint" }, "to", -1)),
          e("input", {
            id: v("to"),
            class: "rg-input",
            type: "date",
            "aria-label": "To",
            value: ((D = t.node.value) == null ? void 0 : D[1]) ?? "",
            onChange: b[3] || (b[3] = (p) => c(1, p.target.value))
          }, null, 40, Ga)
        ], 64))
      ], 64)) : t.node.op === "between" ? (s(), n(j, { key: 3 }, [
        e("input", {
          id: v("from"),
          class: "rg-input",
          type: h.value,
          "aria-label": "From",
          style: { width: "110px" },
          value: ((_ = t.node.value) == null ? void 0 : _[0]) ?? "",
          onChange: b[4] || (b[4] = (p) => c(0, p.target.value))
        }, null, 40, Ka),
        b[10] || (b[10] = e("span", { class: "rg-faint" }, "and", -1)),
        e("input", {
          id: v("to"),
          class: "rg-input",
          type: h.value,
          "aria-label": "To",
          style: { width: "110px" },
          value: ((f = t.node.value) == null ? void 0 : f[1]) ?? "",
          onChange: b[5] || (b[5] = (p) => c(1, p.target.value))
        }, null, 40, Ha)
      ], 64)) : ["in", "not_in"].includes(t.node.op) ? (s(), ae(Ia, {
        key: 4,
        "input-id": v("list"),
        "model-value": Array.isArray(t.node.value) ? t.node.value : [],
        field: t.node.target.includes(".") ? t.node.target : null,
        numeric: g.value,
        "onUpdate:modelValue": A
      }, null, 8, ["input-id", "model-value", "field", "numeric"])) : (s(), n("input", {
        key: 5,
        id: v("value"),
        class: "rg-input",
        type: h.value,
        "aria-label": "Value",
        style: Se({ width: i.value ? "auto" : "160px" }),
        value: t.node.value ?? "",
        onChange: b[6] || (b[6] = (p) => d(p.target.value))
      }, null, 44, Wa));
    };
  }
}, Ja = {
  key: 0,
  class: "rg-filter-row"
}, Qa = {
  class: "rg-bool-toggle",
  role: "group",
  "aria-label": "How filters combine"
}, Za = ["aria-pressed"], Xa = ["aria-pressed"], eo = ["title"], to = ["id", "value", "onChange"], lo = ["value"], so = ["aria-label", "onClick"], no = {
  key: 1,
  class: "rg-faint",
  style: { margin: "0", "font-size": "12px" }
}, ao = /* @__PURE__ */ Object.assign({ name: "FilterGroupView" }, {
  __name: "FilterGroupView",
  props: {
    group: { type: Object, required: !0 },
    nested: { type: Boolean, default: !1 }
  },
  setup(t) {
    const o = t, l = $e(Ee);
    function r(g) {
      o.group.boolean = g;
    }
    function i(g) {
      let h = null;
      try {
        h = JSON.parse(g.dataTransfer.getData("application/x-rg"));
      } catch {
        return;
      }
      (h == null ? void 0 : h.kind) === "field" && l.addField(h.dataset, h.field, "filters", null, h.path, o.group.uid, h.label);
    }
    return (g, h) => {
      const a = cl("FilterGroupView", !0);
      return s(), n("div", {
        class: oe(t.nested ? "rg-filter-group" : "rg-filters"),
        onDragover: h[3] || (h[3] = (v) => t.nested && [...v.dataTransfer.types].includes("application/x-rg") && v.preventDefault()),
        onDrop: h[4] || (h[4] = ge((v) => t.nested && (v.preventDefault(), i(v)), ["stop"]))
      }, [
        t.group.items.length > 1 || t.nested ? (s(), n("div", Ja, [
          h[5] || (h[5] = e("span", {
            class: "rg-faint",
            style: { "font-size": "12px" }
          }, "Match", -1)),
          e("span", Qa, [
            e("button", {
              type: "button",
              "aria-pressed": t.group.boolean === "and" ? "true" : "false",
              onClick: h[0] || (h[0] = (v) => r("and"))
            }, "ALL", 8, Za),
            e("button", {
              type: "button",
              "aria-pressed": t.group.boolean === "or" ? "true" : "false",
              onClick: h[1] || (h[1] = (v) => r("or"))
            }, "ANY", 8, Xa)
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
            onClick: h[2] || (h[2] = (v) => F(l).removeFilter(t.group.uid))
          }, "Remove group")) : C("", !0)
        ])) : C("", !0),
        (s(!0), n(j, null, G(t.group.items, (v) => (s(), n(j, {
          key: v.uid
        }, [
          v.items ? (s(), ae(a, {
            key: 0,
            group: v,
            nested: ""
          }, null, 8, ["group"])) : (s(), n("div", {
            key: 1,
            class: oe(["rg-filter-row", { "rg-filter-row--error": F(l).state.errorUid === v.uid }])
          }, [
            e("span", {
              class: "rg-filter-field",
              title: v.target
            }, [
              v.isTotal ? (s(), ae(P, {
                key: 0,
                name: "hash",
                small: ""
              })) : C("", !0),
              N(" " + w(v.label), 1)
            ], 8, eo),
            e("select", {
              id: `rg-filter-${v.uid}-op`,
              class: "rg-select",
              "aria-label": "Condition",
              value: v.op,
              onChange: (A) => F(l).updateFilter(v, { op: A.target.value })
            }, [
              (s(!0), n(j, null, G(F(Pt)(v.type, v.isTotal), (A) => (s(), n("option", {
                key: A,
                value: A
              }, w(F(Ft)[A]), 9, lo))), 128))
            ], 40, to),
            O(Ya, {
              node: v,
              onUpdate: (A) => F(l).updateFilter(v, A)
            }, null, 8, ["node", "onUpdate"]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
              "aria-label": `Remove filter on ${v.label}`,
              onClick: (A) => F(l).removeFilter(v.uid)
            }, [
              O(P, {
                name: "x",
                small: ""
              })
            ], 8, so)
          ], 2))
        ], 64))), 128)),
        t.nested && !t.group.items.length ? (s(), n("p", no, " Drop fields here to add conditions to this group. ")) : C("", !0)
      ], 34);
    };
  }
}), oo = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }), ro = new Intl.NumberFormat("en"), io = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function Xe(t) {
  return t == null ? "—" : t < 1e4 ? ro.format(t) : oo.format(t);
}
const uo = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function al(t, o = Date.now()) {
  if (!t) return "";
  const l = Math.round((new Date(t).getTime() - o) / 1e3);
  for (const [r, i] of uo)
    if (Math.abs(l) >= i) return io.format(Math.round(l / i), r);
  return "just now";
}
const At = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], co = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], Ot = /* @__PURE__ */ new Map();
function ol(t, o, l) {
  const r = `${t}|${o}|${l}`;
  return Ot.has(r) || Ot.set(r, new Intl.NumberFormat("en", {
    minimumFractionDigits: t,
    maximumFractionDigits: t,
    useGrouping: o,
    style: l ? "percent" : "decimal"
  })), Ot.get(r);
}
function go(t) {
  if (!t) return null;
  const o = t.includes("%"), l = t.includes(",");
  return { decimals: (t.split(".")[1] ?? "").replace(/[^0#]/g, "").length, grouping: l, percent: o };
}
function bl(t, o, l = "decimal") {
  const r = typeof t == "number" ? t : Number(t);
  if (!Number.isFinite(r)) return String(t);
  const i = go(o);
  if (i) return ol(i.decimals, i.grouping, i.percent).format(r);
  const g = l === "integer" || Number.isInteger(r) ? 0 : 2;
  return ol(g, !0, !1).format(r);
}
function mo(t) {
  const o = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(t));
  return o ? { year: +o[1], month: +o[2], day: +o[3], hour: o[4] !== void 0 ? +o[4] : null, minute: o[5] !== void 0 ? +o[5] : null } : null;
}
function po(t, o = null, l = "date") {
  if (o === "month_of_year") return At[(+t - 1) % 12] ?? String(t);
  if (o === "day_of_week") return co[(+t - 1) % 7] ?? String(t);
  if (o === "hour_of_day") return `${String(t).padStart(2, "0")}:00`;
  const r = mo(t);
  if (!r) return String(t);
  const i = `${r.day} ${At[r.month - 1]} ${r.year}`;
  switch (o) {
    case "year":
      return String(r.year);
    case "quarter":
      return `Q${Math.floor((r.month - 1) / 3) + 1} ${r.year}`;
    case "month":
      return `${At[r.month - 1]} ${r.year}`;
    case "week":
      return `Week of ${i}`;
    case "hour":
      return `${i}, ${String(r.hour ?? 0).padStart(2, "0")}:00`;
    case "day":
      return i;
    default:
      return l === "datetime" && r.hour !== null ? `${i}, ${String(r.hour).padStart(2, "0")}:${String(r.minute).padStart(2, "0")}` : i;
  }
}
function xe(t, o) {
  return t == null || t === "" ? o.kind === "measure" ? "–" : "(empty)" : o.grain || o.type === "date" || o.type === "datetime" ? po(t, o.grain, o.type) : o.type === "boolean" ? t === !0 || t === 1 || t === "1" || t === "t" ? "Yes" : "No" : o.type === "integer" || o.type === "decimal" || o.kind === "measure" ? bl(t, o.format, o.type) : String(t);
}
function Ze(t) {
  return !t.grain && (t.kind === "measure" || t.type === "integer" || t.type === "decimal");
}
const vo = {
  class: "rg-gridbar",
  role: "toolbar",
  "aria-label": "Grid"
}, fo = {
  class: "rg-gridbar__group",
  style: { position: "relative" }
}, bo = ["aria-expanded"], ho = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, yo = ["onDragstart", "onDrop"], $o = ["checked", "onChange"], _o = { class: "rg-colchooser__moves" }, ko = ["aria-label", "disabled", "onClick"], wo = ["aria-label", "disabled", "onClick"], xo = {
  key: 1,
  style: { position: "relative" }
}, Co = ["aria-expanded"], So = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, Mo = { class: "rg-colchooser__head" }, To = { class: "rg-sorter__n" }, Eo = { class: "rg-sorter__col" }, Ao = ["aria-label"], Oo = ["aria-pressed", "onClick"], Ro = ["aria-pressed", "onClick"], Do = ["aria-label", "disabled", "onClick"], Lo = ["aria-label", "onClick"], No = {
  key: 0,
  class: "rg-faint rg-colchooser__hint"
}, Vo = ["value"], Fo = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Row height"
}, Po = ["aria-pressed"], Uo = ["aria-pressed"], Io = ["aria-pressed"], qo = ["aria-pressed"], jo = { class: "rg-gridbar__group rg-gridbar__end" }, zo = ["title"], Bo = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Browse"
}, Go = ["aria-pressed"], Ko = ["aria-pressed", "disabled", "title"], Ho = {
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
  setup(t, { emit: o }) {
    const l = t, r = o, i = B(!1), g = (p) => {
      var y;
      return ((y = l.columns.find((E) => E.alias === p)) == null ? void 0 : y.label) ?? p;
    }, h = q(() => l.columns.filter((p) => !l.sort.some((y) => y.field === p.alias)));
    function a(p, y) {
      r("sort", l.sort.map((E, x) => x === p ? { ...E, ...y } : E));
    }
    function v(p) {
      r("sort", l.sort.filter((y, E) => E !== p));
    }
    function A(p, y) {
      const E = [...l.sort], x = p + y;
      x < 0 || x >= E.length || (E.splice(x, 0, E.splice(p, 1)[0]), r("sort", E));
    }
    function c(p) {
      p && r("sort", [...l.sort, { field: p, dir: "asc" }]);
    }
    const d = B(!1), u = B(null), b = q(() => l.columns.filter((p) => l.prefs.hidden.includes(p.alias)).length);
    function T(p) {
      const y = l.prefs.hidden;
      l.prefs.hidden = y.includes(p) ? y.filter((E) => E !== p) : [...y, p];
    }
    function D(p, y) {
      const E = l.columns.map((M) => M.alias), x = E.indexOf(p);
      x === -1 || y < 0 || y >= E.length || x === y || (E.splice(y, 0, E.splice(x, 1)[0]), l.prefs.order = E);
    }
    function _(p) {
      u.value !== null && (D(u.value, l.columns.findIndex((y) => y.alias === p)), u.value = null);
    }
    function f() {
      Object.assign(l.prefs, { hidden: [], order: [], widths: {} });
    }
    return (p, y) => (s(), n("div", vo, [
      e("div", fo, [
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--sm",
          "aria-expanded": d.value,
          onClick: y[0] || (y[0] = (E) => d.value = !d.value)
        }, [
          O(P, {
            name: "table",
            small: ""
          }),
          y[14] || (y[14] = N(" Columns ", -1)),
          b.value ? (s(), n("span", ho, w(b.value) + " hidden", 1)) : C("", !0)
        ], 8, bo),
        d.value ? (s(), ae(ot, {
          key: 0,
          class: "rg-colchooser",
          onClose: y[3] || (y[3] = (E) => d.value = !1)
        }, {
          default: ue(() => [
            e("div", { class: "rg-colchooser__head" }, [
              y[15] || (y[15] = e("b", null, "Columns", -1)),
              e("button", {
                type: "button",
                class: "rg-linkish",
                onClick: f
              }, "Reset")
            ]),
            O(je, {
              tag: "ul",
              name: "rg-list-move",
              class: "rg-colchooser__list"
            }, {
              default: ue(() => [
                (s(!0), n(j, null, G(t.columns, (E, x) => (s(), n("li", {
                  key: E.alias,
                  draggable: "true",
                  class: oe({ "is-dragging": u.value === E.alias }),
                  onDragstart: (M) => u.value = E.alias,
                  onDragend: y[1] || (y[1] = (M) => u.value = null),
                  onDragover: y[2] || (y[2] = ge(() => {
                  }, ["prevent"])),
                  onDrop: ge((M) => _(E.alias), ["prevent"])
                }, [
                  y[16] || (y[16] = e("span", {
                    class: "rg-colchooser__grip",
                    "aria-hidden": "true"
                  }, "⋮⋮", -1)),
                  e("label", null, [
                    e("input", {
                      type: "checkbox",
                      class: "rg-check",
                      checked: !t.prefs.hidden.includes(E.alias),
                      onChange: (M) => T(E.alias)
                    }, null, 40, $o),
                    N(" " + w(E.label), 1)
                  ]),
                  e("span", _o, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${E.label} up`,
                      disabled: x === 0,
                      onClick: (M) => D(E.alias, x - 1)
                    }, "↑", 8, ko),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${E.label} down`,
                      disabled: x === t.columns.length - 1,
                      onClick: (M) => D(E.alias, x + 1)
                    }, "↓", 8, wo)
                  ])
                ], 42, yo))), 128))
              ]),
              _: 1
            }),
            y[17] || (y[17] = e("p", { class: "rg-faint rg-colchooser__hint" }, "Drag to reorder. Drag a header's edge to resize it.", -1))
          ]),
          _: 1
        })) : C("", !0),
        t.canSort ? (s(), n("div", xo, [
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--sm",
            "aria-expanded": i.value,
            onClick: y[4] || (y[4] = (E) => i.value = !i.value)
          }, [
            O(P, {
              name: "sort",
              small: ""
            }),
            y[18] || (y[18] = N(" Sort ", -1)),
            t.sort.length ? (s(), n("span", So, w(t.sort.length), 1)) : C("", !0)
          ], 8, Co),
          i.value ? (s(), ae(ot, {
            key: 0,
            class: "rg-sorter",
            onClose: y[7] || (y[7] = (E) => i.value = !1)
          }, {
            default: ue(() => [
              e("div", Mo, [
                y[19] || (y[19] = e("b", null, "Sort by", -1)),
                t.sort.length ? (s(), n("button", {
                  key: 0,
                  type: "button",
                  class: "rg-linkish",
                  onClick: y[5] || (y[5] = (E) => r("sort", []))
                }, "Clear")) : C("", !0)
              ]),
              O(je, {
                tag: "ol",
                name: "rg-list-move",
                class: "rg-sorter__list"
              }, {
                default: ue(() => [
                  (s(!0), n(j, null, G(t.sort, (E, x) => (s(), n("li", {
                    key: E.field
                  }, [
                    e("span", To, w(x === 0 ? "Sort by" : "then"), 1),
                    e("b", Eo, w(g(E.field)), 1),
                    e("div", {
                      class: "rg-segmented",
                      role: "group",
                      "aria-label": `Direction for ${g(E.field)}`
                    }, [
                      e("button", {
                        type: "button",
                        "aria-pressed": E.dir === "asc",
                        onClick: (M) => a(x, { dir: "asc" })
                      }, "↑ Asc", 8, Oo),
                      e("button", {
                        type: "button",
                        "aria-pressed": E.dir === "desc",
                        onClick: (M) => a(x, { dir: "desc" })
                      }, "↓ Desc", 8, Ro)
                    ], 8, Ao),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${g(E.field)} up`,
                      disabled: x === 0,
                      onClick: (M) => A(x, -1)
                    }, "↑", 8, Do),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Remove ${g(E.field)}`,
                      onClick: (M) => v(x)
                    }, [
                      O(P, {
                        name: "x",
                        small: ""
                      })
                    ], 8, Lo)
                  ]))), 128))
                ]),
                _: 1
              }),
              t.sort.length ? C("", !0) : (s(), n("p", No, "Rows come in the database's order. Add a level, or Shift+click headers.")),
              t.sort.length < 5 && h.value.length ? (s(), n("select", {
                key: 1,
                class: "rg-input",
                "aria-label": "Add a sort level",
                onChange: y[6] || (y[6] = (E) => {
                  c(E.target.value), E.target.value = "";
                })
              }, [
                y[20] || (y[20] = e("option", { value: "" }, "+ Add a sort level…", -1)),
                (s(!0), n(j, null, G(h.value, (E) => (s(), n("option", {
                  key: E.alias,
                  value: E.alias
                }, w(E.label), 9, Vo))), 128))
              ], 32)) : C("", !0)
            ]),
            _: 1
          })) : C("", !0)
        ])) : C("", !0),
        e("div", Fo, [
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.density === "comfortable",
            title: "Comfortable rows",
            onClick: y[8] || (y[8] = (E) => t.prefs.density = "comfortable")
          }, "Comfortable", 8, Po),
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.density === "compact",
            title: "Compact rows",
            onClick: y[9] || (y[9] = (E) => t.prefs.density = "compact")
          }, "Compact", 8, Uo)
        ]),
        e("button", {
          type: "button",
          class: "rg-chip-toggle",
          "aria-pressed": t.prefs.freeze,
          title: "Keep the first column visible while scrolling sideways",
          onClick: y[10] || (y[10] = (E) => t.prefs.freeze = !t.prefs.freeze)
        }, " Freeze first column ", 8, Io),
        t.canTotal ? (s(), n("button", {
          key: 2,
          type: "button",
          class: "rg-chip-toggle",
          "aria-pressed": t.prefs.totals,
          title: "Grand totals of the whole report, not just the loaded rows",
          onClick: y[11] || (y[11] = (E) => t.prefs.totals = !t.prefs.totals)
        }, " Σ Totals ", 8, qo)) : C("", !0)
      ]),
      e("div", jo, [
        t.summary ? (s(), n("span", {
          key: 0,
          class: "rg-faint rg-num",
          title: `${t.summary.duration_ms} ms`
        }, w(F(Xe)(t.summary.rows)) + " rows", 9, zo)) : C("", !0),
        e("div", Bo, [
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.paging === "scroll",
            onClick: y[12] || (y[12] = (E) => t.prefs.paging = "scroll")
          }, "Scroll", 8, Go),
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.paging === "pages",
            disabled: t.grouped,
            title: t.grouped ? "Groups load as you open them; pages are for flat reports" : "Numbered pages",
            onClick: y[13] || (y[13] = (E) => t.prefs.paging = "pages")
          }, "Pages", 8, Ko)
        ])
      ])
    ]));
  }
}, Wo = { class: "rg-colmenu__title" }, Yo = {
  class: "rg-colmenu__group",
  role: "group",
  "aria-label": "Sort"
}, Jo = ["aria-pressed"], Qo = ["aria-pressed"], Zo = ["disabled"], Xo = { class: "rg-colmenu__label" }, er = ["value"], tr = {
  key: 0,
  class: "rg-colmenu__range"
}, lr = ["type"], sr = ["type"], nr = ["type", "step"], ar = { class: "rg-colmenu__actions" }, or = ["disabled"], rr = {
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
  setup(t, { emit: o }) {
    var f, p, y, E;
    const l = t, r = o, i = q(() => l.column.kind !== "dimension"), g = q(() => {
      const x = l.column.type;
      return l.column.grain ? "date" : i.value ? ["date", "datetime"].includes(x) ? x : "decimal" : x ?? "string";
    }), h = q(() => Pt(g.value, i.value && !["date", "datetime"].includes(g.value)).filter((x) => x !== "in" || g.value !== "boolean")), a = q(() => ["integer", "decimal"].includes(g.value) ? "number" : ["date", "datetime"].includes(g.value) ? "date" : "text"), v = be({
      op: ((f = l.filter) == null ? void 0 : f.op) ?? h.value[0],
      value: l.filter && !Array.isArray(l.filter.value) ? l.filter.value ?? "" : "",
      from: Array.isArray((p = l.filter) == null ? void 0 : p.value) ? l.filter.value[0] ?? "" : "",
      to: Array.isArray((y = l.filter) == null ? void 0 : y.value) ? l.filter.value[1] ?? "" : "",
      list: ["in", "not_in"].includes((E = l.filter) == null ? void 0 : E.op) ? (l.filter.value ?? []).join(", ") : ""
    }), A = q(() => ["is_null", "not_null"].includes(v.op)), c = q(() => ["in", "not_in"].includes(v.op)), d = q(() => v.op === "between");
    function u(x) {
      return a.value === "number" ? x === "" || x === null ? null : Number(x) : g.value === "boolean" ? x === "true" || x === !0 : x;
    }
    const b = q(() => A.value ? null : d.value ? [u(v.from), u(v.to)] : c.value ? v.list.split(",").map((x) => x.trim()).filter(Boolean).map(u) : u(v.value)), T = q(() => {
      const x = b.value;
      return A.value ? !0 : Array.isArray(x) ? x.length > 0 && x.every((M) => M !== "" && M !== null && !Number.isNaN(M)) : x !== "" && x !== null && x !== void 0 && !Number.isNaN(x);
    });
    function D() {
      T.value && (r("filter", { op: v.op, value: b.value }), r("close"));
    }
    const _ = q(() => ["integer", "decimal"].includes(g.value) ? ["1 → 9", "9 → 1"] : ["date", "datetime"].includes(g.value) ? ["Oldest first", "Newest first"] : ["A → Z", "Z → A"]);
    return (x, M) => (s(), ae(ot, {
      class: "rg-colmenu",
      onClose: M[12] || (M[12] = ($) => r("close"))
    }, {
      default: ue(() => [
        e("div", Wo, [
          e("b", null, w(t.column.label), 1)
        ]),
        e("div", Yo, [
          e("button", {
            type: "button",
            class: "rg-colmenu__item",
            "aria-pressed": t.sorted === "asc" && t.level <= 1,
            onClick: M[0] || (M[0] = ($) => {
              r("sort", "asc", !1), r("close");
            })
          }, [
            O(P, {
              name: "sort",
              small: ""
            }),
            N(" Sort " + w(_.value[0]), 1)
          ], 8, Jo),
          e("button", {
            type: "button",
            class: "rg-colmenu__item",
            "aria-pressed": t.sorted === "desc" && t.level <= 1,
            onClick: M[1] || (M[1] = ($) => {
              r("sort", "desc", !1), r("close");
            })
          }, [
            O(P, {
              name: "sort",
              small: "",
              class: "rg-flip"
            }),
            N(" Sort " + w(_.value[1]), 1)
          ], 8, Qo),
          e("button", {
            type: "button",
            class: "rg-colmenu__item",
            disabled: t.level === 1,
            onClick: M[2] || (M[2] = ($) => {
              r("sort", t.sorted === "asc" ? "desc" : "asc", !0), r("close");
            })
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            N(" " + w(t.level ? "Flip in the sort order" : "Then by this column"), 1)
          ], 8, Zo),
          t.sorted ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-colmenu__item",
            onClick: M[3] || (M[3] = ($) => {
              r("unsort"), r("close");
            })
          }, [
            O(P, {
              name: "x",
              small: ""
            }),
            M[13] || (M[13] = N(" Remove sort ", -1))
          ])) : C("", !0)
        ]),
        t.canFilter ? (s(), n("form", {
          key: 0,
          class: "rg-colmenu__filter",
          onSubmit: ge(D, ["prevent"])
        }, [
          e("span", Xo, [
            O(P, {
              name: "filter",
              small: ""
            }),
            N(" Filter " + w(i.value ? "totals" : "rows"), 1)
          ]),
          se(e("select", {
            "onUpdate:modelValue": M[4] || (M[4] = ($) => v.op = $),
            class: "rg-input",
            "aria-label": "Condition"
          }, [
            (s(!0), n(j, null, G(h.value, ($) => (s(), n("option", {
              key: $,
              value: $
            }, w(F(Ft)[$]), 9, er))), 128))
          ], 512), [
            [Re, v.op]
          ]),
          A.value ? C("", !0) : (s(), n(j, { key: 0 }, [
            d.value ? (s(), n("div", tr, [
              se(e("input", {
                "onUpdate:modelValue": M[5] || (M[5] = ($) => v.from = $),
                class: "rg-input",
                type: a.value,
                "aria-label": "From"
              }, null, 8, lr), [
                [wt, v.from]
              ]),
              M[14] || (M[14] = e("span", { class: "rg-faint" }, "and", -1)),
              se(e("input", {
                "onUpdate:modelValue": M[6] || (M[6] = ($) => v.to = $),
                class: "rg-input",
                type: a.value,
                "aria-label": "To"
              }, null, 8, sr), [
                [wt, v.to]
              ])
            ])) : c.value ? se((s(), n("input", {
              key: 1,
              "onUpdate:modelValue": M[7] || (M[7] = ($) => v.list = $),
              class: "rg-input",
              placeholder: "Values, separated by commas",
              "aria-label": "Values"
            }, null, 512)), [
              [ce, v.list]
            ]) : g.value === "boolean" ? se((s(), n("select", {
              key: 2,
              "onUpdate:modelValue": M[8] || (M[8] = ($) => v.value = $),
              class: "rg-input",
              "aria-label": "Value"
            }, [...M[15] || (M[15] = [
              e("option", { value: "true" }, "Yes", -1),
              e("option", { value: "false" }, "No", -1)
            ])], 512)), [
              [Re, v.value]
            ]) : se((s(), n("input", {
              key: 3,
              "onUpdate:modelValue": M[9] || (M[9] = ($) => v.value = $),
              class: "rg-input",
              type: a.value,
              step: a.value === "number" ? "any" : void 0,
              "aria-label": "Value",
              placeholder: "Value"
            }, null, 8, nr)), [
              [wt, v.value]
            ])
          ], 64)),
          e("div", ar, [
            t.filter ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              onClick: M[10] || (M[10] = ($) => {
                r("unfilter"), r("close");
              })
            }, "Clear")) : C("", !0),
            e("button", {
              type: "submit",
              class: "rg-btn rg-btn--sm rg-btn--primary",
              disabled: !T.value
            }, "Apply filter", 8, or)
          ])
        ], 32)) : C("", !0),
        t.column.alias !== "__tree" ? (s(), n("button", {
          key: 1,
          type: "button",
          class: "rg-colmenu__item rg-colmenu__hide",
          onClick: M[11] || (M[11] = ($) => {
            r("hide"), r("close");
          })
        }, [
          O(P, {
            name: "eyeOff",
            small: ""
          }),
          M[16] || (M[16] = N(" Hide column ", -1))
        ])) : C("", !0)
      ]),
      _: 1
    }));
  }
}, ir = ["aria-rowcount", "aria-busy"], ur = ["aria-sort", "data-sorted", "data-filtered"], dr = { class: "rg-th" }, cr = ["title", "onClick"], gr = { class: "rg-th__label" }, mr = {
  key: 0,
  class: "rg-sort",
  "aria-hidden": "true"
}, pr = { key: 0 }, vr = ["aria-label", "aria-expanded", "onClick"], fr = ["aria-label", "onMousedown", "onDblclick"], br = {
  key: 0,
  class: "rg-grid__more"
}, hr = ["colspan"], yr = ["onClick"], $r = ["onMousedown", "onMouseenter"], _r = {
  key: 0,
  class: "rg-tree"
}, kr = ["aria-expanded", "aria-label", "onClick"], wr = {
  key: 1,
  style: { width: "20px", display: "inline-block" }
}, xr = { key: 1 }, Cr = ["colspan"], Sr = { key: 0 }, Mr = { class: "rg-grid__totals" }, Tr = { key: 0 }, Er = {
  key: 1,
  class: "rg-muted",
  style: { padding: "10px 16px" }
}, Ar = { class: "rg-gridfoot" }, Or = {
  key: "stats",
  class: "rg-gridfoot__stats",
  "aria-live": "polite"
}, Rr = { key: 0 }, Dr = { class: "rg-num" }, Lr = { key: 1 }, Nr = { class: "rg-num" }, Vr = { key: 2 }, Fr = { class: "rg-num" }, Pr = { key: 3 }, Ur = { class: "rg-num" }, Ir = { class: "rg-num" }, qr = {
  key: "rows",
  class: "rg-gridfoot__stats rg-faint"
}, jr = { key: 0 }, zr = { key: 1 }, Br = ["title"], Gr = {
  key: 3,
  class: "rg-gridfoot__hint"
}, Kr = {
  key: 0,
  class: "rg-pager",
  "aria-label": "Pages"
}, Hr = { class: "rg-pager__size" }, Wr = ["value"], Yr = ["disabled"], Jr = ["disabled"], Qr = { class: "rg-num" }, Zr = ["max", "value"], Xr = ["disabled"], ei = ["disabled"], qt = {
  __name: "ResultGrid",
  setup(t, { expose: o }) {
    const l = $e(Ee), r = be(/* @__PURE__ */ new Map()), i = be(/* @__PURE__ */ new Set()), g = B([]), h = B(null), a = B(null);
    let v = 0, A = null;
    const c = { hidden: [], order: [], widths: {}, density: "comfortable", freeze: !0, totals: !0, paging: "scroll", pageSize: 100 }, d = be({ ...c }), u = q(() => {
      var U;
      const V = typeof l.gridKey == "object" ? (U = l.gridKey) == null ? void 0 : U.value : l.gridKey;
      return V ? `rg-grid:${V}` : null;
    });
    function b() {
      if (Object.assign(d, { ...c, hidden: [], order: [], widths: {} }), !!u.value)
        try {
          const V = JSON.parse(window.localStorage.getItem(u.value) ?? "null");
          V && typeof V == "object" && Object.assign(d, V);
        } catch {
        }
    }
    function T() {
      if (u.value)
        try {
          window.localStorage.setItem(u.value, JSON.stringify(d));
        } catch {
        }
    }
    ye(d, T, { deep: !0 }), ye(u, b, { immediate: !0 });
    const D = q(() => l.state.draft), _ = q(() => l.grouped.value), f = q(() => D.value.rows.map((V) => V.as)), p = q(() => Object.fromEntries([...D.value.rows, ...D.value.values].map((V) => [V.as, V]))), y = (V) => JSON.stringify(V);
    function E(V) {
      const U = p.value[V.alias];
      return { ...V, grain: (U == null ? void 0 : U.kind) === "dimension" ? U.grain : null };
    }
    const x = q(() => {
      let V = g.value.filter((J) => J.alias !== "__subtotal").map(E);
      if (_.value) {
        const J = new Set(f.value);
        V = V.filter((te) => !J.has(te.alias));
      }
      const U = d.order;
      return [...V].sort((J, te) => {
        const ie = U.indexOf(J.alias), he = U.indexOf(te.alias);
        return (ie === -1 ? 1e6 : ie) - (he === -1 ? 1e6 : he);
      });
    }), M = q(() => {
      const V = x.value.filter((J) => !d.hidden.includes(J.alias));
      return _.value ? [{
        alias: "__tree",
        label: D.value.rows.map((J) => J.label).join(" › "),
        kind: "dimension",
        type: "string",
        sortAlias: f.value[0]
      }, ...V] : V;
    });
    function $(V) {
      const U = d.widths[V.alias];
      return U ? { width: `${U}px`, minWidth: `${U}px`, maxWidth: `${U}px` } : null;
    }
    const W = q(() => d.paging === "pages" && !_.value), re = B(1), ke = q(() => {
      const V = [], U = (J, te) => {
        const ie = r.get(y(J));
        ie && (ie.rows.forEach((he, Te) => {
          const _e = _.value ? [...J, he[f.value[te]]] : null, Y = _.value ? y(_e) : `${y(J)}#${Te}`;
          V.push({ row: he, level: te, keys: _e, key: Y }), _.value && i.has(Y) && U(_e, te + 1);
        }), ie.hasMore && J.length > 0 && V.push({ more: !0, keys: J, level: te, key: `${y(J)}#more` }));
      };
      return U([], 0), V;
    }), le = q(() => ke.value.filter((V) => !V.more)), L = q(() => r.get(y([])));
    async function Q(V, U = !1) {
      const J = y(V);
      r.has(J) || r.set(J, { rows: [], hasMore: !1, loading: !1 });
      const te = r.get(J);
      if (te.loading) return;
      te.loading = !0;
      const ie = v;
      try {
        const he = W.value && V.length === 0 ? d.pageSize : void 0, Te = W.value && V.length === 0 ? (re.value - 1) * d.pageSize : U ? te.rows.length : 0, _e = await l.fetchRows({ keys: V, offset: Te, top: V.length === 0, size: he, fresh: W.value && V.length === 0 && !U });
        if (ie !== v) return;
        V.length === 0 && !U && (g.value = _e.columns), te.rows = U ? [...te.rows, ..._e.rows] : _e.rows, te.hasMore = _e.page.has_more;
      } catch {
        ie === v && !U && V.length === 0 && (te.rows = []);
      } finally {
        te.loading = !1;
      }
    }
    const I = B(null), R = B(!1), k = B(null);
    async function m() {
      if (I.value = null, k.value = null, !l.fetchSummary || !(d.totals || W.value)) return;
      const V = v;
      R.value = !0;
      try {
        const U = await l.fetchSummary();
        V === v && (I.value = U);
      } catch (U) {
        V === v && (k.value = (U == null ? void 0 : U.message) ?? "Totals are not available.");
      } finally {
        V === v && (R.value = !1);
      }
    }
    const S = q(() => I.value ? Math.max(1, Math.ceil(I.value.rows / d.pageSize)) : null), ee = q(() => d.totals && I.value && Object.keys(I.value.totals ?? {}).length ? I.value.totals : null);
    function ne({ keepPage: V = !1 } = {}) {
      v++, r.clear(), i.clear(), de(), V || (re.value = 1), l.runnable.value ? (Q([]), V || m()) : (g.value = [], I.value = null), Qt(() => {
        var U, J;
        return (J = (U = h.value) == null ? void 0 : U.scrollTo) == null ? void 0 : J.call(U, { top: 0 });
      });
    }
    ye(() => l.state.runSeq, () => ne()), ye(() => [d.paging, d.pageSize], () => ne()), ye(() => d.totals, (V) => V && !I.value && m());
    function me(V) {
      var te;
      const U = S.value ?? ((te = L.value) != null && te.hasMore ? re.value + 1 : re.value), J = Math.min(Math.max(1, V), U);
      J !== re.value && (re.value = J, ne({ keepPage: !0 }));
    }
    function Ce(V) {
      if (i.has(V.key)) {
        i.delete(V.key);
        return;
      }
      i.add(V.key), r.has(V.key) || Q(V.keys);
    }
    function Ie(V) {
      return _.value && V.level < f.value.length - 1;
    }
    function Le(V, U) {
      const J = Number(V.__subtotal ?? 0);
      if (!J) return null;
      const te = g.value.filter((he) => he.kind === "dimension").map((he) => he.alias), ie = te.indexOf(U);
      return ie === -1 || ie < te.length - J ? null : ie === te.length - J ? J === te.length ? "Grand total" : "Total" : "";
    }
    function rt(V, U) {
      return U.alias === "__tree" ? f.value[V.level] : U.alias;
    }
    function vt(V, U) {
      return V.row[rt(V, U)];
    }
    function lt(V, U) {
      if (U.alias === "__tree") {
        const te = f.value[V.level];
        return xe(V.row[te], E({ ...g.value.find((ie) => ie.alias === te) ?? { type: "string", kind: "dimension" }, alias: te }));
      }
      const J = Le(V.row, U.alias);
      return J !== null ? J : xe(V.row[U.alias], U);
    }
    function Ne(V, U) {
      const J = rt(V, U), te = V.row[J];
      return te == null && Le(V.row, J) === null;
    }
    function ze(V, U) {
      const J = vt(V, U);
      return Ze(U) && typeof J == "number" && J < 0;
    }
    function Ue(V) {
      var J;
      const U = V.sortAlias ?? V.alias;
      return ((J = D.value.sort.find((te) => te.field === U)) == null ? void 0 : J.dir) ?? null;
    }
    function st(V) {
      const U = V.sortAlias ?? V.alias;
      return D.value.sort.findIndex((J) => J.field === U) + 1;
    }
    function nt(V) {
      l.setSort ? l.setSort(V.slice(0, 5)) : V[0] && l.toggleSort(V[0].field);
    }
    function ft(V, U, J = !1) {
      const te = V.sortAlias ?? V.alias, ie = D.value.sort.filter((_e) => _e.field !== te);
      if (!J) return nt([{ field: te, dir: U }]);
      const he = D.value.sort.findIndex((_e) => _e.field === te), Te = [...ie];
      Te.splice(he === -1 ? Te.length : he, 0, { field: te, dir: U }), nt(Te);
    }
    function bt(V) {
      const U = V.sortAlias ?? V.alias;
      nt(D.value.sort.filter((J) => J.field !== U));
    }
    function ht(V, U) {
      if (!V.shiftKey || !l.setSort) return l.toggleSort(U.sortAlias ?? U.alias);
      const J = Ue(U);
      J === "desc" ? bt(U) : ft(U, J === "asc" ? "desc" : "asc", !0);
    }
    const Ye = B(null), K = (V) => {
      var U;
      return !!l.filterColumn && ((U = l.filterable) == null ? void 0 : U.value) !== !1 && V.alias !== "__tree";
    }, z = (V) => {
      var U;
      return ((U = l.columnFilter) == null ? void 0 : U.call(l, V.alias)) ?? null;
    };
    function H(V) {
      V.alias !== "__tree" && (d.hidden = [...d.hidden, V.alias]);
    }
    function Z(V) {
      if (V.alias === "__tree" || !ee.value) return "";
      const U = ee.value[V.alias];
      return U == null ? "" : xe(U, V);
    }
    const X = be({ anchor: null, focus: null, dragging: !1 });
    function de() {
      X.anchor = X.focus = null, X.dragging = !1;
    }
    const we = q(() => !X.anchor || !X.focus ? null : {
      r1: Math.min(X.anchor.r, X.focus.r),
      r2: Math.max(X.anchor.r, X.focus.r),
      c1: Math.min(X.anchor.c, X.focus.c),
      c2: Math.max(X.anchor.c, X.focus.c)
    }), ve = q(() => new Map(le.value.map((V, U) => [V.key, U])));
    function Ae(V, U) {
      const J = ve.value.get(V.key), te = we.value;
      return !!te && J >= te.r1 && J <= te.r2 && U >= te.c1 && U <= te.c2;
    }
    function fe(V, U) {
      return X.focus && ve.value.get(V.key) === X.focus.r && X.focus.c === U;
    }
    function yt(V, U, J) {
      var ie;
      if (V.button !== 0 || V.target.closest("button")) return;
      const te = { r: ve.value.get(U.key), c: J };
      V.shiftKey && X.anchor || (X.anchor = te), X.focus = te, X.dragging = !0, (ie = h.value) == null || ie.focus({ preventScroll: !0 });
    }
    function it(V, U) {
      X.dragging && (X.focus = { r: ve.value.get(V.key), c: U });
    }
    function $t() {
      X.dragging = !1;
    }
    function ut() {
      const V = we.value;
      if (!V) return [];
      const U = M.value.slice(V.c1, V.c2 + 1);
      return le.value.slice(V.r1, V.r2 + 1).map((J) => U.map((te) => ({
        column: te,
        value: vt(J, te),
        text: Ne(J, te) ? "" : lt(J, te)
      })));
    }
    const Oe = q(() => {
      const V = ut().flat();
      if (V.length < 2) return null;
      const U = V.filter((ie) => ie.value !== null && ie.value !== void 0 && ie.value !== ""), J = V.filter((ie) => Ze(ie.column) && typeof ie.value == "number").map((ie) => ie.value), te = { cells: V.length, count: U.length, numbers: J.length };
      if (J.length) {
        const ie = J.reduce((he, Te) => he + Te, 0);
        Object.assign(te, { sum: ie, avg: ie / J.length, min: Math.min(...J), max: Math.max(...J) });
      }
      return te;
    });
    async function dt() {
      var J;
      const V = ut();
      if (!V.length) return;
      const U = V.map((te) => te.map((ie) => typeof ie.value == "number" ? String(ie.value) : ie.text.replace(/[\t\n]/g, " ")).join("	")).join(`
`);
      try {
        await ((J = navigator.clipboard) == null ? void 0 : J.writeText(U)), _t.value = !0, setTimeout(() => _t.value = !1, 1200);
      } catch {
      }
    }
    const _t = B(!1);
    function Al(V) {
      const U = V.ctrlKey || V.metaKey;
      if (U && V.key.toLowerCase() === "c" && we.value) {
        V.preventDefault(), dt();
        return;
      }
      if (U && V.key.toLowerCase() === "a" && le.value.length) {
        V.preventDefault(), X.anchor = { r: 0, c: 0 }, X.focus = { r: le.value.length - 1, c: M.value.length - 1 };
        return;
      }
      if (V.key === "Escape") {
        de();
        return;
      }
      const te = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[V.key];
      if (!te || !X.focus) return;
      V.preventDefault();
      const ie = getComputedStyle(h.value).direction === "rtl" && te[1] !== 0, he = {
        r: Math.min(Math.max(0, X.focus.r + te[0]), le.value.length - 1),
        c: Math.min(Math.max(0, X.focus.c + (ie ? -te[1] : te[1])), M.value.length - 1)
      };
      X.focus = he, V.shiftKey || (X.anchor = he), Qt(() => {
        var Te, _e, Y;
        return (Y = (_e = (Te = h.value) == null ? void 0 : Te.querySelector(".rg-cell--focus")) == null ? void 0 : _e.scrollIntoView) == null ? void 0 : Y.call(_e, { block: "nearest", inline: "nearest" });
      });
    }
    let Je = null;
    function Ol(V, U) {
      const J = V.target.closest("th");
      Je = { alias: U.alias, x: V.clientX, width: J.getBoundingClientRect().width, rtl: getComputedStyle(J).direction === "rtl" }, document.addEventListener("mousemove", Kt), document.addEventListener("mouseup", Ht, { once: !0 }), V.preventDefault();
    }
    function Kt(V) {
      if (!Je) return;
      const U = (V.clientX - Je.x) * (Je.rtl ? -1 : 1);
      d.widths = { ...d.widths, [Je.alias]: Math.round(Math.max(60, Math.min(800, Je.width + U))) };
    }
    function Ht() {
      Je = null, document.removeEventListener("mousemove", Kt);
    }
    function Wt(V) {
      const { [V.alias]: U, ...J } = d.widths;
      d.widths = J;
    }
    Me(() => {
      typeof IntersectionObserver < "u" && (A = new IntersectionObserver((V) => {
        var U;
        W.value || V.some((J) => J.isIntersecting) && ((U = L.value) != null && U.hasMore) && !L.value.loading && Q([], !0);
      }, { root: h.value, rootMargin: "200px" }), a.value && A.observe(a.value)), document.addEventListener("mouseup", $t), l.runnable.value && l.state.runSeq > 0 && ne();
    }), Fe(() => {
      A == null || A.disconnect(), document.removeEventListener("mouseup", $t), Ht();
    }), o({ loadMore: () => Q([], !0), summary: I, prefs: d, stats: Oe, copySelection: dt, goTo: me, page: re });
    const kt = (V) => bl(V, null);
    return (V, U) => {
      var J, te, ie, he, Te, _e;
      return s(), n("div", {
        class: oe(["rg-gridbox", [`rg-gridbox--${d.density}`, { "rg-gridbox--frozen": d.freeze, "is-running": F(l).state.running }]])
      }, [
        U[16] || (U[16] = e("div", {
          class: "rg-progress",
          "aria-hidden": "true"
        }, null, -1)),
        O(Ho, {
          columns: x.value,
          prefs: d,
          grouped: _.value,
          "can-total": !!F(l).fetchSummary,
          summary: I.value,
          "summary-loading": R.value,
          sort: D.value.sort,
          "can-sort": !!F(l).setSort,
          onSort: nt,
          onAutosize: U[0] || (U[0] = (Y) => Wt(Y))
        }, null, 8, ["columns", "prefs", "grouped", "can-total", "summary", "summary-loading", "sort", "can-sort"]),
        e("div", {
          ref_key: "wrap",
          ref: h,
          class: "rg-grid-wrap",
          tabindex: "0",
          role: "grid",
          "aria-rowcount": ((J = I.value) == null ? void 0 : J.rows) ?? void 0,
          "aria-busy": F(l).state.running ? "true" : "false",
          onKeydown: Al
        }, [
          M.value.length ? (s(), n("table", {
            key: 0,
            class: oe(["rg-grid", { "rg-grid--selecting": X.dragging }])
          }, [
            e("thead", null, [
              e("tr", null, [
                (s(!0), n(j, null, G(M.value, (Y) => (s(), n("th", {
                  key: Y.alias,
                  scope: "col",
                  class: oe({ "rg-num": F(Ze)(Y) }),
                  style: Se($(Y)),
                  "aria-sort": Ue(Y) === "asc" ? "ascending" : Ue(Y) === "desc" ? "descending" : "none",
                  "data-sorted": Ue(Y) || void 0,
                  "data-filtered": z(Y) ? "true" : void 0
                }, [
                  e("div", dr, [
                    e("button", {
                      type: "button",
                      class: "rg-th__sort",
                      title: `Sort by ${Y.label} (Shift+click to add a level)`,
                      onClick: (pe) => ht(pe, Y)
                    }, [
                      e("span", gr, w(Y.label), 1),
                      Ue(Y) ? (s(), n("span", mr, [
                        N(w(Ue(Y) === "asc" ? "↑" : "↓"), 1),
                        D.value.sort.length > 1 ? (s(), n("sup", pr, w(st(Y)), 1)) : C("", !0)
                      ])) : C("", !0)
                    ], 8, cr),
                    e("button", {
                      type: "button",
                      class: oe(["rg-th__menu", { "is-active": !!z(Y) }]),
                      "aria-label": `${Y.label}: sort and filter`,
                      "aria-expanded": Ye.value === Y.alias,
                      onClick: ge((pe) => Ye.value = Ye.value === Y.alias ? null : Y.alias, ["stop"])
                    }, [
                      O(P, {
                        name: z(Y) ? "filter" : "more",
                        small: ""
                      }, null, 8, ["name"])
                    ], 10, vr),
                    Ye.value === Y.alias ? (s(), ae(rr, {
                      key: 0,
                      column: Y,
                      sorted: Ue(Y),
                      level: st(Y),
                      "can-filter": K(Y),
                      filter: z(Y),
                      onSort: (pe, Be) => ft(Y, pe, Be),
                      onUnsort: (pe) => bt(Y),
                      onFilter: (pe) => F(l).filterColumn(Y, pe),
                      onUnfilter: (pe) => F(l).filterColumn(Y, null),
                      onHide: (pe) => H(Y),
                      onClose: U[1] || (U[1] = (pe) => Ye.value = null)
                    }, null, 8, ["column", "sorted", "level", "can-filter", "filter", "onSort", "onUnsort", "onFilter", "onUnfilter", "onHide"])) : C("", !0)
                  ]),
                  e("span", {
                    class: "rg-resize",
                    role: "separator",
                    "aria-orientation": "vertical",
                    "aria-label": `Resize ${Y.label}`,
                    title: "Drag to resize, double-click to fit",
                    onMousedown: (pe) => Ol(pe, Y),
                    onDblclick: (pe) => Wt(Y)
                  }, null, 40, fr)
                ], 14, ur))), 128))
              ])
            ]),
            e("tbody", null, [
              (te = L.value) != null && te.loading && !L.value.rows.length ? (s(), n(j, { key: 0 }, G(8, (Y) => e("tr", {
                key: `sk${Y}`,
                class: "rg-row--skeleton"
              }, [
                (s(!0), n(j, null, G(M.value, (pe) => (s(), n("td", {
                  key: pe.alias
                }, [
                  e("span", {
                    class: "rg-skeleton",
                    style: Se({ width: `${40 + (Y * 23 + pe.alias.length * 7) % 50}%` })
                  }, null, 4)
                ]))), 128))
              ])), 64)) : C("", !0),
              (s(!0), n(j, null, G(ke.value, (Y) => (s(), n(j, {
                key: Y.key
              }, [
                Y.more ? (s(), n("tr", br, [
                  e("td", {
                    colspan: M.value.length
                  }, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--sm rg-btn--ghost",
                      onClick: (pe) => Q(Y.keys, !0)
                    }, "Show more", 8, yr)
                  ], 8, hr)
                ])) : (s(), n("tr", {
                  key: 1,
                  class: oe(["rg-row", { "rg-row--group": Ie(Y), "rg-row--subtotal": Number(Y.row.__subtotal) > 0 }])
                }, [
                  (s(!0), n(j, null, G(M.value, (pe, Be) => {
                    var Yt, Jt;
                    return s(), n("td", {
                      key: pe.alias,
                      class: oe({
                        "rg-num": F(Ze)(pe),
                        "rg-cell--empty": Ne(Y, pe),
                        "rg-cell--negative": ze(Y, pe),
                        "rg-cell--selected": Ae(Y, Be),
                        "rg-cell--focus": fe(Y, Be)
                      }),
                      style: Se([$(pe), Be === 0 && _.value ? { paddingInlineStart: `${12 + Y.level * 20}px` } : null]),
                      onMousedown: (Tt) => yt(Tt, Y, Be),
                      onMouseenter: (Tt) => it(Y, Be)
                    }, [
                      Be === 0 && _.value ? (s(), n("span", _r, [
                        Ie(Y) ? (s(), n("button", {
                          key: 0,
                          type: "button",
                          class: "rg-tree__toggle",
                          "aria-expanded": i.has(Y.key) ? "true" : "false",
                          "aria-label": `${i.has(Y.key) ? "Collapse" : "Expand"} ${lt(Y, pe)}`,
                          onClick: (Tt) => Ce(Y)
                        }, [
                          O(P, {
                            name: (Yt = r.get(Y.key)) != null && Yt.loading ? "loader" : "chevron",
                            small: "",
                            spin: !!((Jt = r.get(Y.key)) != null && Jt.loading)
                          }, null, 8, ["name", "spin"])
                        ], 8, kr)) : (s(), n("span", wr)),
                        N(" " + w(lt(Y, pe)), 1)
                      ])) : (s(), n(j, { key: 1 }, [
                        N(w(lt(Y, pe)), 1)
                      ], 64))
                    ], 46, $r);
                  }), 128))
                ], 2))
              ], 64))), 128)),
              L.value && !L.value.rows.length && !L.value.loading && !F(l).state.error ? (s(), n("tr", xr, [
                e("td", {
                  colspan: M.value.length,
                  class: "rg-muted",
                  style: { "text-align": "center", height: "80px" }
                }, "No rows match these filters.", 8, Cr)
              ])) : C("", !0)
            ]),
            ee.value && ((ie = L.value) != null && ie.rows.length) ? (s(), n("tfoot", Sr, [
              e("tr", Mr, [
                (s(!0), n(j, null, G(M.value, (Y, pe) => (s(), n("td", {
                  key: Y.alias,
                  class: oe({ "rg-num": F(Ze)(Y) }),
                  style: Se($(Y))
                }, [
                  pe === 0 && !Z(Y) ? (s(), n("b", Tr, "Grand total")) : (s(), n(j, { key: 1 }, [
                    N(w(Z(Y)), 1)
                  ], 64))
                ], 6))), 128))
              ])
            ])) : C("", !0)
          ], 2)) : C("", !0),
          e("div", {
            ref_key: "sentinel",
            ref: a,
            class: "rg-sentinel"
          }, null, 512),
          !W.value && ((he = L.value) != null && he.hasMore) && ((Te = L.value) != null && Te.loading) && L.value.rows.length ? (s(), n("div", Er, "Loading more…")) : C("", !0)
        ], 40, ir),
        e("footer", Ar, [
          O(tt, {
            name: "rg-swap",
            mode: "out-in"
          }, {
            default: ue(() => [
              Oe.value ? (s(), n("div", Or, [
                Oe.value.numbers ? (s(), n("span", Rr, [
                  U[8] || (U[8] = N("Sum ", -1)),
                  e("b", Dr, w(kt(Oe.value.sum)), 1)
                ])) : C("", !0),
                Oe.value.numbers ? (s(), n("span", Lr, [
                  U[9] || (U[9] = N("Average ", -1)),
                  e("b", Nr, w(kt(Oe.value.avg)), 1)
                ])) : C("", !0),
                Oe.value.numbers ? (s(), n("span", Vr, [
                  U[10] || (U[10] = N("Min ", -1)),
                  e("b", Fr, w(kt(Oe.value.min)), 1)
                ])) : C("", !0),
                Oe.value.numbers ? (s(), n("span", Pr, [
                  U[11] || (U[11] = N("Max ", -1)),
                  e("b", Ur, w(kt(Oe.value.max)), 1)
                ])) : C("", !0),
                e("span", null, [
                  U[12] || (U[12] = N("Count ", -1)),
                  e("b", Ir, w(F(Xe)(Oe.value.count)), 1)
                ]),
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--ghost",
                  title: "Copy (Ctrl+C)",
                  onClick: dt
                }, [
                  O(P, {
                    name: _t.value ? "check" : "copy",
                    small: ""
                  }, null, 8, ["name"]),
                  N(" " + w(_t.value ? "Copied" : "Copy"), 1)
                ])
              ])) : (s(), n("div", qr, [
                I.value ? (s(), n("span", jr, w(F(Xe)(I.value.rows)) + " " + w(I.value.rows === 1 ? "row" : "rows"), 1)) : R.value ? (s(), n("span", zr, [
                  O(P, {
                    name: "loader",
                    spin: "",
                    small: ""
                  }),
                  U[13] || (U[13] = N(" Counting…", -1))
                ])) : k.value ? (s(), n("span", {
                  key: 2,
                  title: k.value
                }, "Total rows unavailable", 8, Br)) : C("", !0),
                le.value.length ? (s(), n("span", Gr, "Click and drag to select cells")) : C("", !0)
              ]))
            ]),
            _: 1
          }),
          W.value ? (s(), n("nav", Kr, [
            e("label", Hr, [
              U[14] || (U[14] = N(" Rows per page ", -1)),
              se(e("select", {
                "onUpdate:modelValue": U[2] || (U[2] = (Y) => d.pageSize = Y),
                class: "rg-input"
              }, [
                (s(), n(j, null, G([50, 100, 200, 500, 1e3], (Y) => e("option", {
                  key: Y,
                  value: Y
                }, w(Y), 9, Wr)), 64))
              ], 512), [
                [
                  Re,
                  d.pageSize,
                  void 0,
                  { number: !0 }
                ]
              ])
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "First page",
              disabled: re.value === 1,
              onClick: U[3] || (U[3] = (Y) => me(1))
            }, "«", 8, Yr),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Previous page",
              disabled: re.value === 1,
              onClick: U[4] || (U[4] = (Y) => me(re.value - 1))
            }, "‹", 8, Jr),
            e("span", Qr, [
              U[15] || (U[15] = N("Page ", -1)),
              e("input", {
                class: "rg-input rg-pager__input",
                type: "number",
                min: "1",
                max: S.value ?? void 0,
                value: re.value,
                "aria-label": "Page",
                onChange: U[5] || (U[5] = (Y) => me(Number(Y.target.value)))
              }, null, 40, Zr),
              S.value ? (s(), n(j, { key: 0 }, [
                N(" of " + w(F(Xe)(S.value)), 1)
              ], 64)) : C("", !0)
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Next page",
              disabled: S.value ? re.value >= S.value : !((_e = L.value) != null && _e.hasMore),
              onClick: U[6] || (U[6] = (Y) => me(re.value + 1))
            }, "›", 8, Xr),
            S.value ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Last page",
              disabled: re.value >= S.value,
              onClick: U[7] || (U[7] = (Y) => me(S.value))
            }, "»", 8, ei)) : C("", !0)
          ])) : C("", !0)
        ])
      ], 2);
    };
  }
}, ti = {
  class: "rg-results",
  "aria-label": "Results"
}, li = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, si = { class: "rg-num" }, ni = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, ai = {
  key: 1,
  class: "rg-num",
  title: "How many rows the database expects to read"
}, oi = {
  key: 2,
  class: "rg-badge rg-badge--warning",
  title: "Large enough that exporting it will run in the background"
}, ri = {
  key: 2,
  class: "rg-faint"
}, ii = ["aria-expanded"], ui = {
  key: 0,
  class: "rg-mono",
  style: { margin: "0", padding: "10px 16px", "max-height": "160px", overflow: "auto", background: "var(--rg-sunken)", "white-space": "pre-wrap", "font-size": "11.5px" }
}, di = {
  key: 1,
  class: "rg-errorbox",
  role: "alert"
}, ci = { class: "rg-errorbox__title" }, gi = {
  key: 0,
  class: "rg-errorbox__options"
}, mi = ["onClick"], pi = {
  key: 0,
  class: "rg-badge rg-badge--warning"
}, vi = {
  __name: "ResultsPanel",
  setup(t) {
    const o = $e(Ee), l = B(!1), r = q(() => o.state.meta), i = q(() => o.state.error), g = {
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
    return (a, v) => {
      var A, c, d;
      return s(), n("section", ti, [
        e("div", li, [
          F(o).state.running ? (s(), n(j, { key: 0 }, [
            e("span", null, [
              O(P, {
                name: "loader",
                spin: "",
                small: ""
              }),
              v[2] || (v[2] = N(" Running…", -1))
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              onClick: v[0] || (v[0] = (u) => {
                F(o).cancelRunning(), F(o).state.running = !1;
              })
            }, [
              O(P, {
                name: "stop",
                small: ""
              }),
              v[3] || (v[3] = N(" Stop ", -1))
            ])
          ], 64)) : r.value && !i.value ? (s(), n(j, { key: 1 }, [
            e("span", null, w(g[r.value.mode] ?? r.value.mode), 1),
            e("span", si, w(r.value.duration_ms) + " ms", 1),
            r.value.cached ? (s(), n("span", ni, "from cache")) : C("", !0),
            r.value.estimated_rows !== void 0 ? (s(), n("span", ai, " reads ~" + w(F(Xe)(r.value.estimated_rows)) + " rows ", 1)) : C("", !0),
            r.value.heavy ? (s(), n("span", oi, "heavy")) : C("", !0)
          ], 64)) : F(o).runnable.value ? C("", !0) : (s(), n("span", ri, "Add fields to see results.")),
          v[4] || (v[4] = e("span", { class: "rg-spacer" }, null, -1)),
          (A = r.value) != null && A.sql ? (s(), n("button", {
            key: 3,
            type: "button",
            class: "rg-btn rg-btn--sm rg-btn--ghost",
            "aria-expanded": l.value,
            onClick: v[1] || (v[1] = (u) => l.value = !l.value)
          }, w(l.value ? "Hide SQL" : "SQL"), 9, ii)) : C("", !0)
        ]),
        e("div", null, [
          l.value && ((c = r.value) != null && c.sql) ? (s(), n("pre", ui, w(r.value.sql), 1)) : C("", !0),
          i.value ? (s(), n("div", di, [
            e("span", ci, [
              O(P, {
                name: "alert",
                small: ""
              }),
              N(w(h[i.value.code] ?? "This report cannot run yet"), 1)
            ]),
            e("span", null, w(i.value.message), 1),
            i.value.code === "AMBIGUOUS_PATH" && F(o).state.errorUid ? (s(), n("div", gi, [
              (s(!0), n(j, null, G(((d = i.value.details) == null ? void 0 : d.options) ?? [], (u) => (s(), n("button", {
                key: u.path.join("."),
                type: "button",
                class: "rg-btn",
                onClick: (b) => F(o).applyPath(F(o).state.errorUid, u.path)
              }, [
                N(w(u.description) + " ", 1),
                u.multiplies_rows ? (s(), n("span", pi, "several per row")) : C("", !0)
              ], 8, mi))), 128))
            ])) : C("", !0)
          ])) : C("", !0)
        ]),
        O(qt)
      ]);
    };
  }
}, fi = /* @__PURE__ */ new Set(["AND", "OR", "NOT", "TRUE", "FALSE", "NULL"]);
function hl(t) {
  const o = [];
  let l = 0, r = 0;
  for (; l < t.length; ) {
    const i = t[l];
    if (i === "'" || i === '"') {
      l > r && o.push({ code: !0, text: t.slice(r, l) });
      let g = l + 1;
      for (; g < t.length && t[g] !== i; ) g++;
      o.push({ code: !1, text: t.slice(l, g + 1) }), l = g + 1, r = l;
    } else l++;
  }
  return r < t.length && o.push({ code: !0, text: t.slice(r) }), o;
}
function bi(t, o) {
  const l = /* @__PURE__ */ new Map();
  for (const g of o)
    l.set(String(g.label ?? "").trim().toLowerCase(), g.as), l.set(String(g.as).toLowerCase(), g.as);
  const r = [];
  return { formula: hl(t).map((g) => g.code ? g.text.replace(/\[([^\]]+)\]/g, (h, a) => {
    const v = l.get(a.trim().toLowerCase());
    return v || r.push(a.trim()), v ?? `[${a}]`;
  }) : g.text).join(""), unknown: r };
}
function hi(t, o) {
  const l = new Map(o.map((r) => [r.as, r.label ?? r.as]));
  return hl(t ?? "").map((r) => r.code ? r.text.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b(\s*\()?/g, (i, g, h) => h || fi.has(g.toUpperCase()) || !l.has(g) ? i : `[${l.get(g)}]`) : r.text).join("");
}
const yi = ["aria-label"], $i = { class: "rg-dialog__head" }, _i = { class: "rg-dialog__body" }, ki = { class: "rg-dialog__foot" }, We = {
  __name: "RgDialog",
  props: { title: { type: String, required: !0 } },
  emits: ["close"],
  setup(t, { emit: o }) {
    const l = o, r = B(null);
    function i(g) {
      g.key === "Escape" && l("close");
    }
    return Me(() => {
      var g, h, a;
      document.addEventListener("keydown", i), (a = ((g = r.value) == null ? void 0 : g.querySelector(".rg-dialog__body textarea, .rg-dialog__body input, .rg-dialog__body button")) ?? ((h = r.value) == null ? void 0 : h.querySelector(".rg-dialog__foot button"))) == null || a.focus();
    }), Fe(() => document.removeEventListener("keydown", i)), (g, h) => (s(), ae(ul, { to: "body" }, [
      e("div", dl({ class: "rg-root rg-overlay" }, g.$attrs, {
        onMousedown: h[1] || (h[1] = ge((a) => l("close"), ["self"]))
      }), [
        e("div", {
          ref_key: "dialog",
          ref: r,
          class: "rg-dialog",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": t.title
        }, [
          e("div", $i, [
            e("h2", null, w(t.title), 1),
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
          e("div", _i, [
            pt(g.$slots, "default")
          ]),
          e("div", ki, [
            pt(g.$slots, "footer")
          ])
        ], 8, yi)
      ], 16)
    ]));
  }
}, wi = {
  key: 0,
  class: "rg-quick",
  "aria-label": "Quick formulas"
}, xi = { class: "rg-quick__head" }, Ci = { class: "rg-quick__kinds" }, Si = ["aria-pressed", "onClick"], Mi = {
  key: 0,
  class: "rg-quick__pick"
}, Ti = ["value"], Ei = { key: 0 }, Ai = ["value"], Oi = ["disabled"], Ri = {
  key: 1,
  class: "rg-faint"
}, Di = { class: "rg-formula-row" }, Li = {
  class: "rg-formula-field",
  for: "rg-formula-label"
}, Ni = {
  class: "rg-formula-field rg-formula-field--format",
  for: "rg-formula-format"
}, Vi = ["value"], Fi = {
  class: "rg-formula-field",
  for: "rg-formula-text"
}, Pi = ["data-state"], Ui = ["onKeydown"], Ii = {
  key: "c",
  class: "rg-check-result"
}, qi = { class: "rg-formula-help" }, ji = { class: "rg-token-list" }, zi = ["data-kind", "title", "onClick"], Bi = {
  key: 0,
  class: "rg-faint",
  style: { "font-size": "12px" }
}, Gi = { class: "rg-formula-help__title" }, Ki = { class: "rg-token-list" }, Hi = ["title", "onClick"], Wi = ["disabled"], Yi = {
  __name: "FormulaDialog",
  props: { item: { type: Object, default: null } },
  emits: ["close"],
  setup(t, { emit: o }) {
    var I, R;
    const l = t, r = o, i = $e(Ee), g = $e("rg-theme", "light"), { api: h } = Pe(), a = q(() => [...i.state.draft.rows, ...i.state.draft.values].filter((k) => {
      var m;
      return k.uid !== ((m = l.item) == null ? void 0 : m.uid);
    })), v = q(() => a.value.filter((k) => k.kind !== "dimension" && !["date", "datetime"].includes(k.type) || k.kind === "formula" || k.kind === "dimension" && ["integer", "decimal"].includes(k.type))), A = q(() => a.value.filter((k) => ["date", "datetime"].includes(k.type) || k.grain)), c = B(((I = l.item) == null ? void 0 : I.label) ?? ""), d = B(l.item ? hi(l.item.formula, a.value) : ""), u = B(((R = l.item) == null ? void 0 : R.format) ?? ""), b = B(null), T = B(null), D = B(!1), _ = be({ kind: "", a: "", b: "" }), f = [
      ["", "Automatic"],
      ["#,##0", "Whole number"],
      ["#,##0.00", "2 decimals"],
      ["0.0%", "Percent (0.25 → 25.0%)"]
    ], p = [
      { kind: "ratio", label: "A per B", hint: "Amount per visit", needs: "numbers", make: (k, m) => [`SAFE_DIVIDE([${k}], [${m}])`, `${k} per ${m}`, "#,##0.00"] },
      { kind: "share", label: "A as % of B", hint: "Coverage, achievement", needs: "numbers", make: (k, m) => [`SAFE_DIVIDE([${k}], [${m}])`, `${k} % of ${m}`, "0.0%"] },
      { kind: "diff", label: "A − B", hint: "Target minus actual", needs: "numbers", make: (k, m) => [`[${k}] - [${m}]`, `${k} − ${m}`, ""] },
      { kind: "sum", label: "A + B", hint: "Add two numbers", needs: "numbers", make: (k, m) => [`[${k}] + [${m}]`, `${k} + ${m}`, ""] },
      { kind: "growth", label: "Change % from B to A", hint: "This month vs last", needs: "numbers", make: (k, m) => [`SAFE_DIVIDE([${k}] - [${m}], [${m}])`, `Change in ${k}`, "0.0%"] },
      { kind: "days", label: "Days from A to B", hint: "Plan to visit, order to delivery", needs: "dates", make: (k, m) => [`DAYS_BETWEEN([${k}], [${m}])`, `Days from ${k} to ${m}`, "#,##0"] },
      { kind: "band", label: "Label A as High / Low", hint: "Above or below a threshold", needs: "numbers", one: !0, make: (k) => [`IF([${k}] >= 100, 'High', 'Low')`, `${k} level`, ""] }
    ], y = q(() => p.find((k) => k.kind === _.kind) ?? null), E = q(() => {
      var k;
      return ((k = y.value) == null ? void 0 : k.needs) === "dates" ? A.value : v.value;
    }), x = q(() => !!y.value && !!_.a && (y.value.one || !!_.b));
    function M(k) {
      Object.assign(_, { kind: _.kind === k ? "" : k, a: "", b: "" });
    }
    function $() {
      if (!x.value) return;
      const [k, m, S] = y.value.make(_.a, _.b);
      d.value = k, c.value = m, u.value = S, _.kind = "";
    }
    const W = [
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
    function re(k) {
      const m = b.value, S = (m == null ? void 0 : m.selectionStart) ?? d.value.length, ee = (m == null ? void 0 : m.selectionEnd) ?? d.value.length;
      d.value = d.value.slice(0, S) + k + d.value.slice(ee), requestAnimationFrame(() => {
        m == null || m.focus();
        const ne = S + (k.includes("(") ? k.indexOf("(") + 1 : k.length);
        m == null || m.setSelectionRange(ne, ne);
      });
    }
    const ke = q(() => bi(d.value, a.value));
    async function le() {
      if (!d.value.trim())
        return T.value = null, !1;
      if (ke.value.unknown.length)
        return T.value = { ok: !1, message: `There is no column named "${ke.value.unknown[0]}" in this report.` }, !1;
      D.value = !0;
      try {
        const k = JSON.parse(JSON.stringify(i.state.draft)), m = { uid: "__probe", kind: "formula", label: c.value || "Formula", formula: ke.value.formula, as: "__formula_check", format: null };
        return l.item ? k.values = k.values.map((S) => S.uid === l.item.uid ? { ...m, as: S.as } : S) : k.values.push(m), await h.query.validate(fl(k).definition), T.value = { ok: !0, message: "Looks good." }, !0;
      } catch (k) {
        return T.value = { ok: !1, message: k.message }, !1;
      } finally {
        D.value = !1;
      }
    }
    let L = null;
    ye(d, () => {
      T.value = null, clearTimeout(L), L = setTimeout(le, 650);
    }), Fe(() => clearTimeout(L));
    async function Q() {
      if (!c.value.trim() || !d.value.trim() || !await le()) return;
      const k = ke.value.formula.trim();
      if (l.item) i.updateFormula(l.item.uid, c.value.trim(), k, u.value || null);
      else {
        const m = i.addFormula(c.value.trim(), k);
        u.value && i.updateItem(m.uid, { format: u.value });
      }
      r("close");
    }
    return (k, m) => (s(), ae(We, {
      title: t.item ? "Edit formula" : "New formula",
      "data-rg-theme": F(g),
      class: "rg-dialog--wide rg-formula-dialog",
      onClose: m[6] || (m[6] = (S) => r("close"))
    }, {
      footer: ue(() => [
        m[20] || (m[20] = e("span", { class: "rg-faint rg-dialog__why" }, "Ctrl+Enter to save", -1)),
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: m[5] || (m[5] = (S) => r("close"))
        }, "Cancel"),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          disabled: D.value || !c.value.trim() || !d.value.trim(),
          onClick: Q
        }, w(t.item ? "Save formula" : "Add formula"), 9, Wi)
      ]),
      default: ue(() => [
        t.item ? C("", !0) : (s(), n("section", wi, [
          e("div", xi, [
            O(P, {
              name: "sparkle",
              small: ""
            }),
            m[7] || (m[7] = N()),
            m[8] || (m[8] = e("b", null, "Quick formula", -1)),
            m[9] || (m[9] = N()),
            m[10] || (m[10] = e("span", { class: "rg-faint" }, "pick one, then the columns", -1))
          ]),
          e("div", Ci, [
            (s(), n(j, null, G(p, (S) => e("button", {
              key: S.kind,
              type: "button",
              class: "rg-quick__kind",
              "aria-pressed": _.kind === S.kind,
              onClick: (ee) => M(S.kind)
            }, [
              e("b", null, w(S.label), 1),
              e("small", null, w(S.hint), 1)
            ], 8, Si)), 64))
          ]),
          O(tt, { name: "rg-swap" }, {
            default: ue(() => [
              y.value ? (s(), n("div", Mi, [
                e("label", null, [
                  m[12] || (m[12] = N("A ", -1)),
                  se(e("select", {
                    "onUpdate:modelValue": m[0] || (m[0] = (S) => _.a = S),
                    class: "rg-input"
                  }, [
                    m[11] || (m[11] = e("option", {
                      value: "",
                      disabled: ""
                    }, "Column…", -1)),
                    (s(!0), n(j, null, G(E.value, (S) => (s(), n("option", {
                      key: S.uid,
                      value: S.label
                    }, w(S.label), 9, Ti))), 128))
                  ], 512), [
                    [Re, _.a]
                  ])
                ]),
                y.value.one ? C("", !0) : (s(), n("label", Ei, [
                  m[14] || (m[14] = N("B ", -1)),
                  se(e("select", {
                    "onUpdate:modelValue": m[1] || (m[1] = (S) => _.b = S),
                    class: "rg-input"
                  }, [
                    m[13] || (m[13] = e("option", {
                      value: "",
                      disabled: ""
                    }, "Column…", -1)),
                    (s(!0), n(j, null, G(E.value, (S) => (s(), n("option", {
                      key: S.uid,
                      value: S.label
                    }, w(S.label), 9, Ai))), 128))
                  ], 512), [
                    [Re, _.b]
                  ])
                ])),
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--primary",
                  disabled: !x.value,
                  onClick: $
                }, "Use", 8, Oi),
                E.value.length ? C("", !0) : (s(), n("span", Ri, "Add " + w(y.value.needs === "dates" ? "date columns" : "numbers") + " to the report first.", 1))
              ])) : C("", !0)
            ]),
            _: 1
          })
        ])),
        e("div", Di, [
          e("label", Li, [
            m[15] || (m[15] = e("span", null, "Column name", -1)),
            se(e("input", {
              id: "rg-formula-label",
              "onUpdate:modelValue": m[2] || (m[2] = (S) => c.value = S),
              class: "rg-input",
              maxlength: "120",
              placeholder: "Visits per doctor"
            }, null, 512), [
              [ce, c.value]
            ])
          ]),
          e("label", Ni, [
            m[16] || (m[16] = e("span", null, "Show as", -1)),
            se(e("select", {
              id: "rg-formula-format",
              "onUpdate:modelValue": m[3] || (m[3] = (S) => u.value = S),
              class: "rg-input"
            }, [
              (s(), n(j, null, G(f, ([S, ee]) => e("option", {
                key: S,
                value: S
              }, w(ee), 9, Vi)), 64))
            ], 512), [
              [Re, u.value]
            ])
          ])
        ]),
        e("label", Fi, [
          m[18] || (m[18] = e("span", null, [
            N("Formula "),
            e("small", { class: "rg-faint" }, "· columns in [brackets], + − * /, comparisons, AND / OR, text in 'quotes'")
          ], -1)),
          e("div", {
            class: "rg-formula-box",
            "data-state": D.value ? "checking" : T.value ? T.value.ok ? "ok" : "error" : "idle"
          }, [
            se(e("textarea", {
              id: "rg-formula-text",
              ref_key: "textarea",
              ref: b,
              "onUpdate:modelValue": m[4] || (m[4] = (S) => d.value = S),
              class: "rg-textarea rg-formula",
              spellcheck: "false",
              placeholder: "[Amount] / [Number of visits]",
              onKeydown: [
                Ke(ge(Q, ["ctrl", "prevent"]), ["enter"]),
                Ke(ge(Q, ["meta", "prevent"]), ["enter"])
              ]
            }, null, 40, Ui), [
              [ce, d.value]
            ]),
            O(tt, {
              name: "rg-swap",
              mode: "out-in"
            }, {
              default: ue(() => [
                D.value ? (s(), n("p", Ii, [
                  O(P, {
                    name: "loader",
                    spin: "",
                    small: ""
                  }),
                  m[17] || (m[17] = N(" Checking…", -1))
                ])) : T.value ? (s(), n("p", {
                  key: T.value.message,
                  class: oe(["rg-check-result", T.value.ok ? "rg-check-result--ok" : "rg-check-result--error"]),
                  role: "status"
                }, [
                  O(P, {
                    name: T.value.ok ? "check" : "alert",
                    small: ""
                  }, null, 8, ["name"]),
                  N(" " + w(T.value.message), 1)
                ], 2)) : C("", !0)
              ]),
              _: 1
            })
          ], 8, Pi)
        ]),
        e("div", qi, [
          e("div", null, [
            m[19] || (m[19] = e("div", { class: "rg-formula-help__title" }, [
              N("Columns "),
              e("small", { class: "rg-faint" }, "click to insert")
            ], -1)),
            e("div", ji, [
              (s(!0), n(j, null, G(a.value, (S) => (s(), n("button", {
                key: S.uid,
                type: "button",
                class: "rg-token rg-token--col",
                "data-kind": S.kind,
                title: S.as,
                onClick: (ee) => re(`[${S.label}]`)
              }, w(S.label), 9, zi))), 128)),
              a.value.length ? C("", !0) : (s(), n("span", Bi, "Add fields first; formulas calculate with them."))
            ])
          ]),
          (s(), n(j, null, G(W, ([S, ee]) => e("div", { key: S }, [
            e("div", Gi, w(S), 1),
            e("div", Ki, [
              (s(!0), n(j, null, G(ee, ([ne, me, Ce]) => (s(), n("button", {
                key: ne,
                type: "button",
                class: "rg-token",
                title: Ce,
                onClick: (Ie) => re(me)
              }, w(ne), 9, Hi))), 128))
            ])
          ])), 64))
        ])
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, Ji = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-name"
}, Qi = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-description"
}, Zi = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-folder"
}, Xi = { id: "rg-save-folders" }, eu = ["value"], tu = { style: { border: "0", padding: "0", margin: "0", display: "flex", "flex-direction": "column", gap: "6px" } }, lu = {
  class: "rg-field-inline",
  for: "rg-vis-private"
}, su = {
  class: "rg-field-inline",
  for: "rg-vis-public"
}, nu = ["disabled"], yl = {
  __name: "SaveDialog",
  props: {
    copy: { type: Boolean, default: !1 },
    folders: { type: Array, default: () => [] }
  },
  emits: ["close", "saved"],
  setup(t, { emit: o }) {
    const l = t, r = o, i = $e(Ee), g = $e("rg-theme", "light"), h = i.state.draft, a = B(l.copy ? `Copy of ${h.name}` : h.name), v = B(h.description), A = B(h.folder), c = B(l.copy ? "private" : h.visibility);
    async function d() {
      try {
        const u = await i.save({ name: a.value, description: v.value, folder: A.value, visibility: c.value, copy: l.copy });
        r("saved", u), r("close");
      } catch {
      }
    }
    return (u, b) => (s(), ae(We, {
      title: t.copy ? "Save a copy" : F(h).uuid ? "Save report" : "Save new report",
      "data-rg-theme": F(g),
      onClose: b[6] || (b[6] = (T) => r("close"))
    }, {
      footer: ue(() => [
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: b[5] || (b[5] = (T) => r("close"))
        }, "Cancel"),
        e("button", {
          type: "submit",
          form: "rg-save-form",
          class: "rg-btn rg-btn--primary",
          disabled: F(i).state.saving || !a.value.trim()
        }, w(F(i).state.saving ? "Saving…" : "Save"), 9, nu)
      ]),
      default: ue(() => [
        e("form", {
          id: "rg-save-form",
          style: { display: "contents" },
          onSubmit: ge(d, ["prevent"])
        }, [
          e("label", Ji, [
            b[7] || (b[7] = N(" Name ", -1)),
            se(e("input", {
              id: "rg-save-name",
              "onUpdate:modelValue": b[0] || (b[0] = (T) => a.value = T),
              class: "rg-input",
              maxlength: "255",
              required: ""
            }, null, 512), [
              [ce, a.value]
            ])
          ]),
          e("label", Qi, [
            b[8] || (b[8] = N(" Description (optional) ", -1)),
            se(e("textarea", {
              id: "rg-save-description",
              "onUpdate:modelValue": b[1] || (b[1] = (T) => v.value = T),
              class: "rg-textarea",
              maxlength: "2000"
            }, null, 512), [
              [ce, v.value]
            ])
          ]),
          e("label", Zi, [
            b[9] || (b[9] = N(" Folder (optional) ", -1)),
            se(e("input", {
              id: "rg-save-folder",
              "onUpdate:modelValue": b[2] || (b[2] = (T) => A.value = T),
              class: "rg-input",
              list: "rg-save-folders",
              maxlength: "255",
              placeholder: "Sales"
            }, null, 512), [
              [ce, A.value]
            ]),
            e("datalist", Xi, [
              (s(!0), n(j, null, G(t.folders, (T) => (s(), n("option", {
                key: T,
                value: T
              }, null, 8, eu))), 128))
            ])
          ]),
          e("fieldset", tu, [
            b[12] || (b[12] = e("legend", {
              class: "rg-muted",
              style: { "font-size": "12px", "margin-bottom": "4px" }
            }, "Who can open it", -1)),
            e("label", lu, [
              se(e("input", {
                id: "rg-vis-private",
                "onUpdate:modelValue": b[3] || (b[3] = (T) => c.value = T),
                type: "radio",
                value: "private"
              }, null, 512), [
                [Zt, c.value]
              ]),
              b[10] || (b[10] = N(" Only me (and people I share it with) ", -1))
            ]),
            e("label", su, [
              se(e("input", {
                id: "rg-vis-public",
                "onUpdate:modelValue": b[4] || (b[4] = (T) => c.value = T),
                type: "radio",
                value: "public"
              }, null, 512), [
                [Zt, c.value]
              ]),
              b[11] || (b[11] = N(" Everyone who builds reports ", -1))
            ]),
            b[13] || (b[13] = e("span", {
              class: "rg-faint",
              style: { "font-size": "11.5px" }
            }, "People who open it only see the rows they are allowed to see.", -1))
          ])
        ], 32)
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, au = {
  key: 0,
  class: "rg-skeleton-list"
}, ou = { class: "rg-muted rg-publish__intro" }, ru = {
  class: "rg-publish__field",
  for: "rg-publish-permission"
}, iu = {
  key: 0,
  class: "rg-publish__error"
}, uu = {
  key: 1,
  class: "rg-faint"
}, du = { class: "rg-publish__field" }, cu = { class: "rg-num rg-faint" }, gu = { class: "rg-search" }, mu = {
  class: "rg-publish__roles",
  role: "group",
  "aria-label": "Roles"
}, pu = ["aria-pressed", "onClick"], vu = {
  key: 0,
  class: "rg-faint"
}, fu = {
  key: 0,
  class: "rg-publish__error"
}, bu = { class: "rg-publish__menu" }, hu = {
  class: "rg-field-inline",
  for: "rg-publish-menu"
}, yu = {
  key: 0,
  class: "rg-publish__field",
  for: "rg-publish-group"
}, $u = {
  key: 0,
  class: "rg-publish__error",
  role: "alert"
}, _u = ["disabled"], ku = ["disabled"], jt = {
  __name: "PublishDialog",
  props: {
    uuid: { type: String, required: !0 },
    name: { type: String, default: "" },
    /** report | dashboard */
    kind: { type: String, default: "report" }
  },
  emits: ["close", "published", "unpublished"],
  setup(t, { emit: o }) {
    const l = t, r = o, { api: i } = Pe(), g = q(() => l.kind === "dashboard" ? i.dashboards : i.reports), h = $e("rg-theme", "light"), a = be({ loading: !0, saving: !1, error: null, errors: {}, published: !1 }), v = be({ permission: "", roles: [], inMenu: !0, menuGroup: "" }), A = B([]), c = B(""), d = q(() => {
      const f = c.value.trim().toLowerCase();
      return A.value.filter((p) => !f || p.name.toLowerCase().includes(f));
    });
    Me(async () => {
      try {
        const [f, p] = await Promise.all([g.value.publishing(l.uuid), i.roles()]);
        A.value = p, a.published = f.published, Object.assign(v, {
          permission: f.permission ?? f.suggested_permission,
          roles: f.roles ?? [],
          inMenu: f.published ? f.in_menu : !0,
          menuGroup: f.menu_group ?? ""
        });
      } catch (f) {
        a.error = f.message;
      } finally {
        a.loading = !1;
      }
    });
    function u(f) {
      v.roles = v.roles.includes(f) ? v.roles.filter((p) => p !== f) : [...v.roles, f];
    }
    async function b() {
      a.saving = !0, a.errors = {}, a.error = null;
      try {
        const f = await g.value.publish(l.uuid, {
          permission: v.permission.trim(),
          roles: v.roles,
          inMenu: v.inMenu,
          menuGroup: v.menuGroup.trim() || null
        });
        r("published", f), r("close");
      } catch (f) {
        a.errors = f.errors ?? {}, a.error = Object.keys(a.errors).length ? null : f.message;
      } finally {
        a.saving = !1;
      }
    }
    async function T() {
      a.saving = !0;
      try {
        const f = await g.value.unpublish(l.uuid);
        r("unpublished", f), r("close");
      } catch (f) {
        a.error = f.message;
      } finally {
        a.saving = !1;
      }
    }
    const D = (f) => {
      var p;
      return ((p = a.errors[f]) == null ? void 0 : p[0]) ?? null;
    }, _ = q(() => {
      var f, p;
      return ((p = (f = Object.entries(a.errors).find(([y]) => y.startsWith("roles"))) == null ? void 0 : f[1]) == null ? void 0 : p[0]) ?? null;
    });
    return (f, p) => (s(), ae(We, {
      title: a.published ? `Publishing: ${t.name}` : `Publish “${t.name}”`,
      "data-rg-theme": F(h),
      onClose: p[5] || (p[5] = (y) => r("close"))
    }, {
      footer: ue(() => [
        a.published ? (s(), n("button", {
          key: 0,
          type: "button",
          class: "rg-btn rg-btn--danger",
          disabled: a.saving,
          onClick: T
        }, "Unpublish", 8, _u)) : C("", !0),
        p[11] || (p[11] = e("span", { style: { flex: "1" } }, null, -1)),
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: p[4] || (p[4] = (y) => r("close"))
        }, "Cancel"),
        e("button", {
          type: "submit",
          form: "rg-publish-form",
          class: "rg-btn rg-btn--primary",
          disabled: a.loading || a.saving || !v.permission.trim()
        }, w(a.saving ? "Saving…" : a.published ? "Update" : "Publish"), 9, ku)
      ]),
      default: ue(() => [
        a.loading ? (s(), n("div", au, [
          (s(), n(j, null, G(4, (y) => e("div", {
            key: y,
            class: "rg-skeleton"
          })), 64))
        ])) : (s(), n("form", {
          key: 1,
          id: "rg-publish-form",
          class: "rg-publish",
          onSubmit: ge(b, ["prevent"])
        }, [
          e("p", ou, " Everyone with the permission below can open " + w(t.kind === "dashboard" ? "this dashboard" : "and run this report") + ", each seeing only their own data. Building reports is not needed. ", 1),
          e("label", ru, [
            p[6] || (p[6] = e("span", null, "Permission", -1)),
            se(e("input", {
              id: "rg-publish-permission",
              "onUpdate:modelValue": p[0] || (p[0] = (y) => v.permission = y),
              class: "rg-input rg-mono",
              maxlength: "191",
              required: "",
              pattern: "[a-z0-9][a-z0-9_.\\-]*"
            }, null, 512), [
              [ce, v.permission]
            ]),
            D("permission") ? (s(), n("small", iu, w(D("permission")), 1)) : (s(), n("small", uu, "Created if it does not exist. Lowercase letters, digits, dots, dashes and underscores."))
          ]),
          e("fieldset", du, [
            e("legend", null, [
              p[7] || (p[7] = N("Roles that get it ", -1)),
              e("span", cu, w(v.roles.length) + " selected", 1)
            ]),
            e("label", gu, [
              p[8] || (p[8] = e("span", { class: "rg-sr-only" }, "Search roles", -1)),
              O(P, { name: "search" }),
              se(e("input", {
                "onUpdate:modelValue": p[1] || (p[1] = (y) => c.value = y),
                class: "rg-input",
                type: "search",
                placeholder: "Search roles",
                autocomplete: "off"
              }, null, 512), [
                [ce, c.value]
              ])
            ]),
            e("div", mu, [
              (s(!0), n(j, null, G(d.value, (y) => (s(), n("button", {
                key: y.id,
                type: "button",
                class: "rg-publish__role",
                "aria-pressed": v.roles.includes(y.name),
                onClick: (E) => u(y.name)
              }, [
                O(P, {
                  name: v.roles.includes(y.name) ? "check" : "plus",
                  small: ""
                }, null, 8, ["name"]),
                N(w(y.name), 1)
              ], 8, pu))), 128)),
              d.value.length ? C("", !0) : (s(), n("span", vu, "No role matches."))
            ]),
            _.value ? (s(), n("small", fu, w(_.value), 1)) : C("", !0)
          ]),
          e("div", bu, [
            e("label", hu, [
              se(e("input", {
                id: "rg-publish-menu",
                "onUpdate:modelValue": p[2] || (p[2] = (y) => v.inMenu = y),
                type: "checkbox",
                class: "rg-check"
              }, null, 512), [
                [mt, v.inMenu]
              ]),
              p[9] || (p[9] = N(" Show in the sidebar ", -1))
            ]),
            v.inMenu ? (s(), n("label", yu, [
              p[10] || (p[10] = e("span", null, "Sidebar group (optional)", -1)),
              se(e("input", {
                id: "rg-publish-group",
                "onUpdate:modelValue": p[3] || (p[3] = (y) => v.menuGroup = y),
                class: "rg-input",
                maxlength: "120",
                placeholder: "Sales"
              }, null, 512), [
                [ce, v.menuGroup]
              ])
            ])) : C("", !0)
          ]),
          a.error ? (s(), n("p", $u, w(a.error), 1)) : C("", !0)
        ], 32))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, wu = 200;
let xu = 0;
const at = () => `c${++xu}`, $l = [
  { key: "line", label: "Line" },
  { key: "division", label: "Division" },
  { key: "employee", label: "Employee" }
];
function rl(t) {
  const o = String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return /^[a-z]/.test(o) ? o.slice(0, 50) : `c_${o}`.slice(0, 50);
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
function Cu(t) {
  var r, i;
  const o = t.definition ?? {}, l = ((r = o.context) == null ? void 0 : r.period) ?? "this_month";
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
    level: o.level ?? "employee",
    period: Array.isArray(l) ? "custom" : l,
    from: Array.isArray(l) ? String(l[0]).slice(0, 10) : "",
    to: Array.isArray(l) ? String(l[1]).slice(0, 10) : "",
    lines: Array.isArray((i = o.context) == null ? void 0 : i.lines) ? [...o.context.lines] : [],
    fields: (o.fields ?? []).map((g) => ({ uid: at(), ...g, label: g.label ?? null })),
    sort: o.sort ?? []
  };
}
function Su(t, o) {
  const l = be({
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
  }), r = q(() => {
    const L = l.draft, Q = L.period === "custom" ? L.from && L.to ? [L.from, L.to] : "this_month" : L.period;
    return {
      type: "combined",
      level: L.level,
      context: { period: Q, ...L.lines.length ? { lines: L.lines } : {} },
      fields: L.fields.map(({ uid: I, ...R }) => Object.fromEntries(Object.entries(R).filter(([, k]) => k != null && k !== ""))),
      sort: L.sort.filter((I) => L.fields.some((R) => R.as === I.field))
    };
  }), i = () => JSON.stringify([r.value, l.draft.name]), g = q(() => l.savedSnapshot !== null && i() !== l.savedSnapshot), h = q(() => l.draft.fields.some((L) => !L.base)), a = q(() => !1), v = q(() => Object.fromEntries(l.reports.map((L) => [L.key, L])));
  async function A(L = null) {
    l.loading = !0;
    try {
      l.draft = L ? Cu(L) : Lt(), l.reports = await t.combine.reports(), l.savedSnapshot = i(), h.value && $();
    } catch (Q) {
      o.error(Q);
    } finally {
      l.loading = !1;
    }
  }
  function c() {
    const L = l.draft;
    return L.period === "custom" ? `${L.from}~${L.to}` : L.period;
  }
  function d(L) {
    return `${L}|${l.draft.level}|${c()}`;
  }
  async function u(L) {
    var I, R;
    const Q = d(L);
    if (!((I = l.fieldsByReport[Q]) != null && I.fields || (R = l.fieldsByReport[Q]) != null && R.loading)) {
      l.fieldsByReport[Q] = { loading: !0, fields: null, error: null };
      try {
        const k = l.draft, m = k.period === "custom" ? k.from && k.to ? [k.from, k.to] : void 0 : k.period, S = await t.combine.fields(L, { level: k.level, period: m, lines: k.lines });
        l.fieldsByReport[Q] = { loading: !1, fields: S, error: null };
      } catch (k) {
        l.fieldsByReport[Q] = { loading: !1, fields: null, error: k.message };
      }
    }
  }
  function b(L) {
    return l.fieldsByReport[d(L)] ?? null;
  }
  function T(L) {
    const Q = new Set(l.draft.fields.map((R) => R.as));
    let I = rl(L) || "column";
    for (let R = 2; Q.has(I); R++) I = `${rl(L)}_${R}`;
    return I;
  }
  function D(L, Q) {
    return l.draft.fields.some((I) => I.report === L && I.field === Q);
  }
  function _(L, Q) {
    var k;
    const I = l.draft.fields.find((m) => m.report === L && m.field === Q.key);
    if (I) {
      E(I.uid);
      return;
    }
    const R = ((k = v.value[L]) == null ? void 0 : k.label) ?? L;
    l.draft.fields.push({ uid: at(), report: L, field: Q.key, as: T(Q.key), label: `${Q.label} (${R})` });
  }
  function f(L) {
    var k;
    const Q = l.draft.fields.find((m) => m.base === L);
    if (Q) {
      E(Q.uid);
      return;
    }
    const I = l.draft.fields.findIndex((m) => !m.base), R = { uid: at(), base: L, as: T(L), label: ((k = $l.find((m) => m.key === L)) == null ? void 0 : k.label) ?? L };
    l.draft.fields.splice(I === -1 ? l.draft.fields.length : I, 0, R);
  }
  function p({ label: L, formula: Q }) {
    const I = { uid: at(), formula: Q, as: T(L || "formula"), label: L || "Formula" };
    return l.draft.fields.push(I), I;
  }
  function y(L, Q) {
    const I = l.draft.fields.find((R) => R.uid === L);
    I && Object.assign(I, Q);
  }
  function E(L) {
    const Q = l.draft.fields.find((I) => I.uid === L);
    l.draft.fields = l.draft.fields.filter((I) => I.uid !== L), Q && (l.draft.sort = l.draft.sort.filter((I) => I.field !== Q.as));
  }
  function x(L, Q) {
    const I = [...l.draft.fields], R = I.findIndex((k) => k.uid === L);
    R === -1 || Q < 0 || Q >= I.length || (I.splice(Q, 0, I.splice(R, 1)[0]), l.draft.fields = I);
  }
  let M = null;
  function $() {
    if (!h.value) {
      l.error = null, l.meta = null;
      return;
    }
    l.runSeq++;
  }
  ye(() => JSON.stringify(r.value), () => {
    clearTimeout(M), M = setTimeout($, 450);
  }), ye(() => [l.draft.level, c()], () => {
    for (const L of Object.keys(l.fieldsByReport))
      l.fieldsByReport[L].fields === null && !l.fieldsByReport[L].loading && delete l.fieldsByReport[L];
  });
  async function W({ offset: L = 0, top: Q = !1, size: I = wu, fresh: R = !1 } = {}) {
    const k = Q && (L === 0 || R);
    k && (l.running = !0, l.error = null);
    try {
      const m = await t.query.rows(r.value, { offset: L, size: I });
      return k && (l.meta = { ...m.meta, columns: m.columns }), m;
    } catch (m) {
      throw k && (l.error = m), m;
    } finally {
      k && (l.running = !1);
    }
  }
  function re(L) {
    const Q = l.draft.sort.find((I) => I.field === L);
    l.draft.sort = Q ? Q.dir === "asc" ? [{ field: L, dir: "desc" }] : [] : [{ field: L, dir: "asc" }];
  }
  function ke(L) {
    l.draft.sort = L;
  }
  async function le({ name: L, description: Q, folder: I, visibility: R, copy: k = !1 } = {}) {
    const m = l.draft, S = {
      name: (L ?? m.name).trim() || "Untitled combined report",
      description: Q ?? m.description,
      folder: (I ?? m.folder) || null,
      visibility: R ?? m.visibility,
      definition: r.value
    };
    l.saving = !0;
    try {
      const ee = m.uuid && !k && m.canEdit ? await t.reports.update(m.uuid, S) : await t.reports.create(S);
      return Object.assign(m, {
        uuid: ee.uuid,
        name: ee.name,
        description: ee.description ?? "",
        folder: ee.folder ?? "",
        visibility: ee.visibility,
        canEdit: ee.can_edit,
        canPublish: ee.can_publish ?? !1,
        published: ee.published ?? !1
      }), l.savedSnapshot = i(), o.success(`Saved "${ee.name}".`), ee;
    } catch (ee) {
      throw o.error(ee), ee;
    } finally {
      l.saving = !1;
    }
  }
  return {
    state: l,
    definition: r,
    dirty: g,
    runnable: h,
    grouped: a,
    reportsByKey: v,
    init: A,
    loadFields: u,
    fieldsOf: b,
    hasField: D,
    toggleField: _,
    toggleBase: f,
    addFormula: p,
    updateColumn: y,
    removeColumn: E,
    moveColumn: x,
    run: $,
    fetchRows: W,
    toggleSort: re,
    setSort: ke,
    fetchSummary: () => t.query.summary(r.value),
    exportReport: async (L) => {
      try {
        const Q = await t.query.export(r.value, L, { name: l.draft.name || "report" });
        o.success(`Exported "${Q}".`);
      } catch (Q) {
        throw o.error(Q), Q;
      }
    },
    gridKey: q(() => l.draft.uuid ? `report:${l.draft.uuid}` : null),
    save: le
  };
}
const Mu = {
  class: "rg-multi",
  style: { position: "relative" }
}, Tu = ["aria-expanded", "aria-label"], Eu = { class: "rg-search" }, Au = { class: "rg-sr-only" }, Ou = ["placeholder"], Ru = ["aria-label"], Du = {
  key: 0,
  class: "rg-faint"
}, Lu = {
  key: 1,
  class: "rg-faint"
}, Nu = ["aria-selected"], Vu = ["checked", "onChange"], Fu = { class: "rg-pop__foot" }, Pu = ["disabled"], et = {
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
  setup(t, { emit: o }) {
    const l = t, r = o, i = B(!1), g = B(""), h = B([]), a = B(/* @__PURE__ */ new Map()), v = B(!1);
    let A = 0, c = null;
    async function d() {
      const f = ++A;
      v.value = !0;
      try {
        const p = await l.load(g.value.trim());
        if (f !== A) return;
        h.value = p, p.forEach((y) => a.value.set(y.id, y.label));
      } catch {
        f === A && (h.value = []);
      } finally {
        f === A && (v.value = !1);
      }
    }
    ye(g, () => {
      clearTimeout(c), c = setTimeout(d, 250);
    }), ye(i, (f) => f && d()), ye(() => l.dependsOn, () => {
      h.value = [], i.value && d();
    }, { deep: !0 });
    const u = q(() => new Set(l.modelValue)), b = q(() => l.modelValue.length ? l.modelValue.length === 1 ? a.value.get(l.modelValue[0]) ?? "1 selected" : `${l.modelValue.length} selected` : l.allLabel);
    function T(f) {
      const p = u.value.has(f) ? l.modelValue.filter((y) => y !== f) : [...l.modelValue, f];
      r("update:modelValue", p);
    }
    function D() {
      r("update:modelValue", []);
    }
    function _() {
      i.value = !1, r("change");
    }
    return (f, p) => (s(), n("div", Mu, [
      e("button", {
        type: "button",
        class: "rg-input rg-multi__button",
        "aria-expanded": i.value,
        "aria-label": `${t.label}: ${b.value}`,
        onClick: p[0] || (p[0] = (y) => i.value ? _() : i.value = !0)
      }, [
        e("span", {
          class: oe({ "rg-faint": !t.modelValue.length })
        }, w(b.value), 3),
        O(P, {
          name: "chevron",
          small: "",
          class: "rg-multi__chev"
        })
      ], 8, Tu),
      O(tt, { name: "rg-swap" }, {
        default: ue(() => [
          i.value ? (s(), ae(ot, {
            key: 0,
            class: "rg-multi__pop",
            onClose: _
          }, {
            default: ue(() => [
              e("label", Eu, [
                e("span", Au, "Search " + w(t.label), 1),
                O(P, { name: "search" }),
                se(e("input", {
                  "onUpdate:modelValue": p[1] || (p[1] = (y) => g.value = y),
                  class: "rg-input",
                  type: "search",
                  placeholder: `Search ${t.label.toLowerCase()}`,
                  autocomplete: "off"
                }, null, 8, Ou), [
                  [ce, g.value]
                ])
              ]),
              e("ul", {
                class: "rg-multi__list",
                role: "listbox",
                "aria-label": t.label,
                "aria-multiselectable": "true"
              }, [
                v.value && !h.value.length ? (s(), n("li", Du, [
                  O(P, {
                    name: "loader",
                    spin: "",
                    small: ""
                  }),
                  p[2] || (p[2] = N(" Loading…", -1))
                ])) : h.value.length ? C("", !0) : (s(), n("li", Lu, "Nothing to pick.")),
                (s(!0), n(j, null, G(h.value, (y) => (s(), n("li", {
                  key: y.id,
                  role: "option",
                  "aria-selected": u.value.has(y.id)
                }, [
                  e("label", null, [
                    e("input", {
                      type: "checkbox",
                      class: "rg-check",
                      checked: u.value.has(y.id),
                      onChange: (E) => T(y.id)
                    }, null, 40, Vu),
                    N(" " + w(y.label), 1)
                  ])
                ], 8, Nu))), 128))
              ], 8, Ru),
              e("div", Fu, [
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--ghost",
                  disabled: !t.modelValue.length,
                  onClick: D
                }, "Clear", 8, Pu),
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--primary",
                  onClick: _
                }, "Done")
              ])
            ]),
            _: 1
          })) : C("", !0)
        ]),
        _: 1
      })
    ]));
  }
}, Qe = (t) => !!t.category, Ge = (t) => (t.values ?? []).length > 0, _l = [
  { value: "kpi", label: "KPI", icon: "hash", hint: "Headline numbers", fits: Ge },
  { value: "bar", label: "Bar", icon: "view", hint: "Top items, across", fits: (t) => Qe(t) && Ge(t) },
  { value: "column", label: "Column", icon: "view", hint: "Top items, upright", fits: (t) => Qe(t) && Ge(t) },
  { value: "line", label: "Line", icon: "clock", hint: "Over time", fits: (t) => Qe(t) && Ge(t) },
  { value: "area", label: "Area", icon: "clock", hint: "Over time, filled", fits: (t) => Qe(t) && Ge(t) },
  { value: "pie", label: "Pie", icon: "globe", hint: "Parts of a whole", fits: (t) => Qe(t) && Ge(t) },
  { value: "donut", label: "Donut", icon: "globe", hint: "Parts, with the total", fits: (t) => Qe(t) && Ge(t) },
  { value: "share", label: "Share bar", icon: "table", hint: "Parts in one bar", fits: (t) => Qe(t) && Ge(t) },
  { value: "table", label: "Table", icon: "table", hint: "First rows", fits: () => !0 }
], kl = ["bar", "column", "pie", "donut", "share"], Uu = { line: 120, area: 120, pie: 6, donut: 6, share: 6 }, Iu = { kpi: "sm", table: "full", line: "full", area: "full" };
function wl(t, o, { resize: l = !1 } = {}) {
  const r = { ...t, type: o };
  kl.includes(o) && (r.values = (t.values ?? []).slice(0, 1)), o === "kpi" && (r.category = null);
  const i = ["pie", "donut", "share"].includes(t.type), g = ["pie", "donut", "share"].includes(o), h = ["line", "area"].includes(t.type), a = ["line", "area"].includes(o);
  return (l || i !== g || h !== a) && (r.top = Uu[o] ?? 10), l && (r.size = Iu[o] ?? "md"), r;
}
const qu = { as: "__count", label: "Number of rows" }, Rt = ["integer", "decimal"];
function xl(t = []) {
  const o = (g) => g.label ?? g.as, l = t.filter((g) => g.kind === "dimension").map((g) => ({ as: g.as, label: o(g), type: g.type ?? null })), r = t.filter((g) => g.kind !== "dimension" && !["date", "datetime", "string", "text", "boolean"].includes(g.type)).map((g) => ({ as: g.as, label: o(g) })), i = t.filter((g) => g.kind === "dimension" && Rt.includes(g.type)).map((g) => ({ as: g.as, label: `${o(g)} (total)` }));
  return { dims: l.filter((g) => !Rt.includes(g.type)).concat(l.filter((g) => Rt.includes(g.type))), nums: [...r, ...i, qu] };
}
function zt(t, o) {
  var l, r;
  if (!((l = t.values) != null && l.length) && t.type !== "table" && (t.values = o.nums[0] ? [o.nums[0].as] : []), !t.category && !["kpi", "table"].includes(t.type)) {
    const i = o.dims.find((g) => ["date", "datetime"].includes(g.type));
    t.category = (["line", "area"].includes(t.type) && i ? i.as : (r = o.dims[0]) == null ? void 0 : r.as) ?? null;
  }
  return t;
}
function ju(t) {
  var o;
  return t != null && t.report ? t.type === "table" ? null : (o = t.values) != null && o.length ? t.type !== "kpi" && !t.category ? "Pick the column to chart by." : null : "Pick a number to show." : "Pick a report.";
}
const zu = { class: "rg-kpi" }, Bu = { class: "rg-kpi__label" }, Gu = ["aria-label"], Ku = {
  __name: "KpiTile",
  props: {
    label: { type: String, required: !0 },
    value: { type: [Number, null], default: null },
    column: { type: Object, required: !0 }
  },
  setup(t) {
    const o = t, l = B(o.value);
    let r = null;
    function i(h, a) {
      var d;
      cancelAnimationFrame(r);
      const v = typeof window < "u" && ((d = window.matchMedia) == null ? void 0 : d.call(window, "(prefers-reduced-motion: reduce)").matches);
      if (a === null || h === null || v || typeof requestAnimationFrame > "u") {
        l.value = a;
        return;
      }
      const A = performance.now(), c = (u) => {
        const b = Math.min(1, (u - A) / 650), T = 1 - (1 - b) ** 3;
        l.value = h + (a - h) * T, b < 1 ? r = requestAnimationFrame(c) : l.value = a;
      };
      r = requestAnimationFrame(c);
    }
    ye(() => o.value, (h, a) => i(a ?? 0, h)), Me(() => i(0, o.value)), Fe(() => cancelAnimationFrame(r));
    const g = (h) => h == null ? "—" : xe(o.column.type === "integer" ? Math.round(h) : h, o.column);
    return (h, a) => (s(), n("div", zu, [
      e("span", Bu, w(t.label), 1),
      e("span", {
        class: "rg-kpi__value rg-num",
        "aria-label": g(t.value)
      }, w(g(l.value)), 9, Gu)
    ]));
  }
};
function Cl(t, o = 4) {
  if (!Number.isFinite(t) || t <= 0) return { max: 1, ticks: [0, 1] };
  const l = t / o, r = 10 ** Math.floor(Math.log10(l)), i = [1, 2, 2.5, 5, 10].map((a) => a * r).find((a) => a >= l) ?? 10 * r, g = Math.ceil(t / i) * i, h = [];
  for (let a = 0; a <= g + i / 2; a += i) h.push(Math.round(a * 1e6) / 1e6);
  return { max: g, ticks: h };
}
function Sl(t, o) {
  return o < 1e4 ? new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(t) : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(t);
}
function Bt(t, o) {
  if (!t) return () => {
  };
  if (o(t.clientWidth || 600), typeof ResizeObserver > "u") return () => {
  };
  const l = new ResizeObserver((r) => o(Math.max(120, Math.round(r[0].contentRect.width))));
  return l.observe(t), () => l.disconnect();
}
const Hu = ["width", "height", "aria-label"], Wu = ["transform", "onMouseenter"], Yu = ["y", "width", "height"], Ju = ["x", "y"], Qu = ["transform"], Zu = ["width"], Xu = ["d"], ed = ["x", "y"], td = { class: "rg-num" }, Ve = 22, ct = 10, ld = 72, sd = {
  __name: "BarChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 }
  },
  setup(t) {
    const o = t, l = B(null), r = B(600), i = B(null);
    let g = () => {
    };
    Me(() => g = Bt(l.value, (u) => r.value = u)), Fe(() => g());
    const h = q(() => Math.min(180, Math.max(80, r.value * 0.32))), a = q(() => Math.max(40, r.value - h.value - ld - 12)), v = q(() => Math.max(0, ...o.rows.map((u) => Number(u[o.value.alias]) || 0))), A = q(() => o.rows.map((u, b) => {
      const T = Number(u[o.value.alias]) || 0, D = v.value > 0 ? Math.max(T > 0 ? 3 : 0, T / v.value * a.value) : 0;
      return { i: b, row: u, v: T, w: D, y: b * (Ve + ct), name: xe(u[o.category.alias], o.category) || "(empty)", text: xe(u[o.value.alias], o.value) };
    })), c = q(() => Math.max(Ve, o.rows.length * (Ve + ct) - ct));
    function d(u) {
      if (u <= 0) return "";
      const b = Math.min(4, u / 2, Ve / 2);
      return `M0,0 H${u - b} Q${u},0 ${u},${b} V${Ve - b} Q${u},${Ve} ${u - b},${Ve} H0 Z`;
    }
    return (u, b) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-bar",
      onMouseleave: b[0] || (b[0] = (T) => i.value = null)
    }, [
      (s(), n("svg", {
        width: r.value,
        height: c.value,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`
      }, [
        (s(!0), n(j, null, G(A.value, (T) => (s(), n("g", {
          key: T.i,
          transform: `translate(0, ${T.y})`,
          class: "rg-bar__row",
          onMouseenter: (D) => i.value = T
        }, [
          e("rect", {
            x: 0,
            y: -ct / 2,
            width: r.value,
            height: Ve + ct,
            fill: "transparent"
          }, null, 8, Yu),
          e("text", {
            x: h.value - 8,
            y: Ve / 2,
            class: "rg-chart__label",
            "text-anchor": "end",
            "dominant-baseline": "central"
          }, w(T.name.length > 24 ? `${T.name.slice(0, 23)}…` : T.name), 9, Ju),
          e("g", {
            transform: `translate(${h.value}, 0)`
          }, [
            e("rect", {
              width: a.value,
              height: Ve,
              class: "rg-bar__track",
              rx: "4"
            }, null, 8, Zu),
            e("path", {
              d: d(T.w),
              class: oe(["rg-bar__fill rg-series-1", { "is-dim": i.value && i.value.i !== T.i }]),
              style: Se({ "--rg-delay": `${T.i * 40}ms` })
            }, null, 14, Xu),
            e("text", {
              x: T.w + 6,
              y: Ve / 2,
              class: "rg-chart__value",
              "dominant-baseline": "central"
            }, w(T.text), 9, ed)
          ], 8, Qu)
        ], 40, Wu))), 128))
      ], 8, Hu)),
      i.value ? (s(), n("div", {
        key: 0,
        class: "rg-chart__tip",
        style: Se({ top: `${i.value.y - 6}px`, insetInlineStart: `${h.value + Math.min(i.value.w, a.value - 120)}px` }),
        role: "status"
      }, [
        e("b", null, w(i.value.name), 1),
        e("span", null, [
          N(w(t.value.label) + ": ", 1),
          e("b", td, w(i.value.text), 1)
        ])
      ], 4)) : C("", !0)
    ], 544));
  }
}, nd = {
  key: 0,
  class: "rg-legend"
}, ad = ["width", "height", "aria-label"], od = ["transform"], rd = { class: "rg-chart__grid" }, id = ["transform"], ud = ["x2"], dd = {
  x: "-8",
  "dominant-baseline": "central",
  "text-anchor": "end",
  class: "rg-chart__axis"
}, cd = ["x", "y"], gd = ["d"], md = ["d"], pd = ["cx", "cy"], vd = ["x", "y"], fd = { key: 0 }, bd = ["x1", "x2", "y2"], hd = ["cx", "cy"], yd = { class: "rg-num" }, $d = {
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
    const o = t, l = B(null), r = B(600), i = B(null);
    let g = () => {
    };
    Me(() => g = Bt(l.value, (_) => r.value = _)), Fe(() => g());
    const h = { top: 12, right: 64, bottom: 28, left: 52 }, a = q(() => Math.max(40, r.value - h.left - h.right)), v = q(() => o.height - h.top - h.bottom), A = q(() => Cl(Math.max(0, ...o.rows.flatMap((_) => o.values.map((f) => Number(_[f.alias]) || 0))))), c = (_) => o.rows.length < 2 ? a.value / 2 : _ / (o.rows.length - 1) * a.value, d = (_) => v.value - (Number(_) || 0) / A.value.max * v.value, u = q(() => o.values.map((_, f) => {
      const p = o.rows.map((x, M) => [c(M), x[_.alias] === null || x[_.alias] === void 0 ? null : d(x[_.alias])]);
      let y = "";
      p.forEach(([x, M], $) => {
        var W;
        M !== null && (y += `${y === "" || ((W = p[$ - 1]) == null ? void 0 : W[1]) === null ? "M" : "L"}${x.toFixed(1)},${M.toFixed(1)}`);
      });
      const E = [...p].reverse().find((x) => x[1] !== null);
      return { column: _, slot: f + 1, d: y, area: o.area && y ? `${y}L${c(o.rows.length - 1)},${v.value}L${c(0)},${v.value}Z` : null, last: E };
    })), b = q(() => {
      const _ = o.rows.length, f = Math.max(1, Math.ceil(_ / Math.max(2, Math.floor(a.value / 70)))), p = o.rows.map((E, x) => ({ i: x, text: xe(E[o.category.alias], o.category) })).filter((E) => E.i % f === 0 || E.i === _ - 1), y = p[p.length - 1];
      return p.filter((E) => E === y || c(y.i) - c(E.i) >= 64);
    });
    function T(_) {
      const f = _.currentTarget.getBoundingClientRect(), p = _.clientX - f.left - h.left;
      if (o.rows.length === 0) return;
      const y = o.rows.length < 2 ? 0 : Math.round(p / a.value * (o.rows.length - 1));
      i.value = Math.min(o.rows.length - 1, Math.max(0, y));
    }
    const D = (_) => {
      var f;
      return xe((f = o.rows[o.rows.length - 1]) == null ? void 0 : f[_.column.alias], _.column);
    };
    return (_, f) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-line"
    }, [
      t.values.length > 1 ? (s(), n("ul", nd, [
        (s(!0), n(j, null, G(u.value, (p) => (s(), n("li", {
          key: p.column.alias
        }, [
          e("i", {
            class: oe(`rg-swatch rg-series-${p.slot}`)
          }, null, 2),
          N(w(p.column.label), 1)
        ]))), 128))
      ])) : C("", !0),
      (s(), n("svg", {
        width: r.value,
        height: t.height,
        role: "img",
        "aria-label": `${t.values.map((p) => p.label).join(", ")} by ${t.category.label}`,
        onMousemove: T,
        onMouseleave: f[0] || (f[0] = (p) => i.value = null)
      }, [
        e("g", {
          transform: `translate(${h.left}, ${h.top})`
        }, [
          e("g", rd, [
            (s(!0), n(j, null, G(A.value.ticks, (p) => (s(), n("g", {
              key: p,
              transform: `translate(0, ${d(p)})`
            }, [
              e("line", { x2: a.value }, null, 8, ud),
              e("text", dd, w(F(Sl)(p, A.value.max)), 1)
            ], 8, id))), 128))
          ]),
          (s(!0), n(j, null, G(b.value, (p) => (s(), n("text", {
            key: p.i,
            x: c(p.i),
            y: v.value + 18,
            "text-anchor": "middle",
            class: "rg-chart__axis"
          }, w(p.text), 9, cd))), 128)),
          (s(!0), n(j, null, G(u.value, (p) => se((s(), n("path", {
            key: `a${p.slot}`,
            d: p.area ?? "",
            class: oe(`rg-line__area rg-series-${p.slot}`)
          }, null, 10, gd)), [
            [Xt, p.area]
          ])), 128)),
          (s(!0), n(j, null, G(u.value, (p) => (s(), n("path", {
            key: `l${p.slot}`,
            d: p.d,
            class: oe(`rg-line__path rg-series-${p.slot}`),
            pathLength: "1"
          }, null, 10, md))), 128)),
          (s(!0), n(j, null, G(u.value, (p) => se((s(), n("g", {
            key: `e${p.slot}`
          }, [
            p.last ? (s(), n("circle", {
              key: 0,
              cx: p.last[0],
              cy: p.last[1],
              r: "4",
              class: oe(`rg-line__dot rg-series-${p.slot}`)
            }, null, 10, pd)) : C("", !0),
            p.last && t.values.length <= 4 ? (s(), n("text", {
              key: 1,
              x: p.last[0] + 8,
              y: p.last[1],
              "dominant-baseline": "central",
              class: "rg-chart__value"
            }, w(D(p)), 9, vd)) : C("", !0)
          ])), [
            [Xt, p.last]
          ])), 128)),
          i.value !== null ? (s(), n("g", fd, [
            e("line", {
              x1: c(i.value),
              x2: c(i.value),
              y2: v.value,
              class: "rg-line__cross"
            }, null, 8, bd),
            (s(!0), n(j, null, G(u.value, (p) => {
              var y, E;
              return s(), n(j, {
                key: `h${p.slot}`
              }, [
                ((y = t.rows[i.value]) == null ? void 0 : y[p.column.alias]) !== null && ((E = t.rows[i.value]) == null ? void 0 : E[p.column.alias]) !== void 0 ? (s(), n("circle", {
                  key: 0,
                  cx: c(i.value),
                  cy: d(t.rows[i.value][p.column.alias]),
                  r: "4",
                  class: oe(`rg-line__dot rg-series-${p.slot}`)
                }, null, 10, hd)) : C("", !0)
              ], 64);
            }), 128))
          ])) : C("", !0)
        ], 8, od)
      ], 40, ad)),
      i.value !== null ? (s(), n("div", {
        key: 1,
        class: "rg-chart__tip",
        style: Se({ top: "8px", insetInlineStart: `${Math.min(h.left + c(i.value) + 12, r.value - 180)}px` }),
        role: "status"
      }, [
        e("b", null, w(F(xe)(t.rows[i.value][t.category.alias], t.category)), 1),
        (s(!0), n(j, null, G(u.value, (p) => (s(), n("span", {
          key: p.column.alias
        }, [
          t.values.length > 1 ? (s(), n("i", {
            key: 0,
            class: oe(`rg-swatch rg-series-${p.slot}`)
          }, null, 2)) : C("", !0),
          N(w(p.column.label) + ": ", 1),
          e("b", yd, w(F(xe)(t.rows[i.value][p.column.alias], p.column)), 1)
        ]))), 128))
      ], 4)) : C("", !0)
    ], 512));
  }
}, _d = { class: "rg-chart rg-share" }, kd = ["aria-label"], wd = ["onMouseenter"], xd = { class: "rg-share__legend" }, Cd = ["onMouseenter"], Sd = { class: "rg-share__name" }, Md = { class: "rg-num" }, Td = { class: "rg-num rg-faint" }, Ed = {
  __name: "ShareBar",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    /** Every part when the widget asked for more; only `parts` get their own color. */
    parts: { type: Number, default: 6 }
  },
  setup(t) {
    const o = t, l = B(null), r = q(() => o.rows.reduce((h, a) => h + Math.max(0, Number(a[o.value.alias]) || 0), 0)), i = q(() => {
      const h = [...o.rows].sort((d, u) => (Number(u[o.value.alias]) || 0) - (Number(d[o.value.alias]) || 0)), a = h.slice(0, Math.min(6, o.parts)), v = h.slice(a.length), A = a.map((d, u) => ({ key: u, slot: u + 1, name: xe(d[o.category.alias], o.category) || "(empty)", v: Math.max(0, Number(d[o.value.alias]) || 0) })), c = v.reduce((d, u) => d + Math.max(0, Number(u[o.value.alias]) || 0), 0);
      return c > 0 && A.push({ key: "other", slot: "other", name: `Other (${v.length})`, v: c }), A.map((d) => ({ ...d, share: r.value > 0 ? d.v / r.value : 0, text: xe(d.v, o.value) }));
    }), g = (h) => new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(h);
    return (h, a) => (s(), n("div", _d, [
      e("div", {
        class: "rg-share__bar",
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`,
        onMouseleave: a[0] || (a[0] = (v) => l.value = null)
      }, [
        (s(!0), n(j, null, G(i.value, (v, A) => (s(), n("span", {
          key: v.key,
          class: oe(["rg-share__seg", `rg-series-${v.slot}`, { "is-dim": l.value !== null && l.value !== v.key }]),
          style: Se({ flexGrow: v.share, "--rg-delay": `${A * 60}ms` }),
          onMouseenter: (c) => l.value = v.key
        }, null, 46, wd))), 128))
      ], 40, kd),
      e("ul", xd, [
        (s(!0), n(j, null, G(i.value, (v) => (s(), n("li", {
          key: v.key,
          class: oe({ "is-hover": l.value === v.key }),
          onMouseenter: (A) => l.value = v.key,
          onMouseleave: a[1] || (a[1] = (A) => l.value = null)
        }, [
          e("i", {
            class: oe(`rg-swatch rg-series-${v.slot}`)
          }, null, 2),
          e("span", Sd, w(v.name), 1),
          e("b", Md, w(v.text), 1),
          e("span", Td, w(g(v.share)), 1)
        ], 42, Cd))), 128))
      ])
    ]));
  }
}, Ad = ["width", "height", "aria-label"], Od = ["transform"], Rd = { class: "rg-chart__grid" }, Dd = ["transform"], Ld = ["x2"], Nd = {
  x: "-8",
  "dominant-baseline": "central",
  "text-anchor": "end",
  class: "rg-chart__axis"
}, Vd = ["onMouseenter"], Fd = ["x", "width", "height"], Pd = ["d", "transform"], Ud = ["x", "y"], Id = ["x", "y"], qd = { class: "rg-num" }, jd = {
  __name: "ColumnChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    height: { type: Number, default: 240 }
  },
  setup(t) {
    const o = t, l = B(null), r = B(600), i = B(null);
    let g = () => {
    };
    Me(() => g = Bt(l.value, (f) => r.value = f)), Fe(() => g());
    const h = { top: 18, right: 8, bottom: 36, left: 48 }, a = q(() => Math.max(40, r.value - h.left - h.right)), v = q(() => o.height - h.top - h.bottom), A = q(() => Cl(Math.max(0, ...o.rows.map((f) => Number(f[o.value.alias]) || 0)))), c = q(() => a.value / Math.max(1, o.rows.length)), d = q(() => Math.min(24, Math.max(4, c.value - 6))), u = q(() => o.rows.map((f, p) => {
      const E = Math.max(0, Number(f[o.value.alias]) || 0) / A.value.max * v.value;
      return {
        i: p,
        h: E,
        x: p * c.value + (c.value - d.value) / 2,
        name: xe(f[o.category.alias], o.category) || "(empty)",
        text: xe(f[o.value.alias], o.value)
      };
    })), b = q(() => Math.max(3, Math.floor(c.value / 6.5))), T = (f) => f.length > b.value ? `${f.slice(0, b.value - 1)}…` : f, D = q(() => c.value >= 34);
    function _(f) {
      if (f <= 0) return "";
      const p = d.value, y = Math.min(4, p / 2, f);
      return `M0,${f} V${y} Q0,0 ${y},0 H${p - y} Q${p},0 ${p},${y} V${f} Z`;
    }
    return (f, p) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-column",
      onMouseleave: p[0] || (p[0] = (y) => i.value = null)
    }, [
      (s(), n("svg", {
        width: r.value,
        height: t.height,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`
      }, [
        e("g", {
          transform: `translate(${h.left}, ${h.top})`
        }, [
          e("g", Rd, [
            (s(!0), n(j, null, G(A.value.ticks, (y) => (s(), n("g", {
              key: y,
              transform: `translate(0, ${v.value - y / A.value.max * v.value})`
            }, [
              e("line", { x2: a.value }, null, 8, Ld),
              e("text", Nd, w(F(Sl)(y, A.value.max)), 1)
            ], 8, Dd))), 128))
          ]),
          (s(!0), n(j, null, G(u.value, (y) => (s(), n("g", {
            key: y.i,
            onMouseenter: (E) => i.value = y
          }, [
            e("rect", {
              x: y.i * c.value,
              y: "0",
              width: c.value,
              height: v.value,
              fill: "transparent"
            }, null, 8, Fd),
            e("path", {
              d: _(y.h),
              transform: `translate(${y.x}, ${v.value - y.h})`,
              class: oe(["rg-column__fill rg-series-1", { "is-dim": i.value && i.value.i !== y.i }]),
              style: Se({ "--rg-delay": `${y.i * 40}ms` })
            }, null, 14, Pd),
            D.value ? (s(), n("text", {
              key: 0,
              x: y.x + d.value / 2,
              y: v.value - y.h - 6,
              "text-anchor": "middle",
              class: "rg-chart__value"
            }, w(y.text), 9, Ud)) : C("", !0),
            e("text", {
              x: y.x + d.value / 2,
              y: v.value + 16,
              "text-anchor": "middle",
              class: "rg-chart__axis"
            }, w(T(y.name)), 9, Id)
          ], 40, Vd))), 128))
        ], 8, Od)
      ], 8, Ad)),
      i.value ? (s(), n("div", {
        key: 0,
        class: "rg-chart__tip",
        style: Se({ top: `${Math.max(0, h.top + v.value - i.value.h - 56)}px`, insetInlineStart: `${Math.min(h.left + i.value.x + d.value + 6, r.value - 170)}px` }),
        role: "status"
      }, [
        e("b", null, w(i.value.name), 1),
        e("span", null, [
          N(w(t.value.label) + ": ", 1),
          e("b", qd, w(i.value.text), 1)
        ])
      ], 4)) : C("", !0)
    ], 544));
  }
}, zd = { class: "rg-chart rg-pie" }, Bd = ["viewBox", "aria-label"], Gd = ["d", "onMouseenter"], Kd = {
  key: 0,
  class: "rg-pie__centre"
}, Hd = ["x", "y"], Wd = ["x", "y"], Yd = { class: "rg-share__legend rg-pie__legend" }, Jd = ["onMouseenter"], Qd = { class: "rg-share__name" }, Zd = { class: "rg-num" }, Xd = { class: "rg-num rg-faint" }, qe = 168, ec = {
  __name: "PieChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    donut: { type: Boolean, default: !1 },
    parts: { type: Number, default: 6 }
  },
  setup(t) {
    const o = t, l = B(null), r = qe / 2 - 2, i = q(() => o.donut ? r * 0.6 : 0), g = q(() => o.rows.reduce((c, d) => c + Math.max(0, Number(d[o.value.alias]) || 0), 0)), h = q(() => {
      const c = [...o.rows].sort((_, f) => (Number(f[o.value.alias]) || 0) - (Number(_[o.value.alias]) || 0)), d = c.slice(0, Math.min(6, o.parts)), u = c.slice(d.length), b = d.map((_, f) => ({ key: f, slot: f + 1, name: xe(_[o.category.alias], o.category) || "(empty)", v: Math.max(0, Number(_[o.value.alias]) || 0) })), T = u.reduce((_, f) => _ + Math.max(0, Number(f[o.value.alias]) || 0), 0);
      T > 0 && b.push({ key: "other", slot: "other", name: `Other (${u.length})`, v: T });
      let D = -Math.PI / 2;
      return b.filter((_) => _.v > 0).map((_) => {
        const f = g.value > 0 ? _.v / g.value : 0, p = D;
        return D += f * Math.PI * 2, { ..._, share: f, start: p, end: D, text: xe(_.v, o.value) };
      });
    });
    function a(c, d, u, b) {
      d - c >= Math.PI * 2 - 1e-6 && (d = c + Math.PI * 2 - 1e-4);
      const T = d - c > Math.PI ? 1 : 0, D = (_, f) => `${(r + 2 + _ * Math.cos(f)).toFixed(2)},${(r + 2 + _ * Math.sin(f)).toFixed(2)}`;
      return b <= 0 ? `M${r + 2},${r + 2} L${D(u, c)} A${u},${u} 0 ${T} 1 ${D(u, d)} Z` : `M${D(u, c)} A${u},${u} 0 ${T} 1 ${D(u, d)} L${D(b, d)} A${b},${b} 0 ${T} 0 ${D(b, c)} Z`;
    }
    const v = (c) => new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(c), A = q(() => l.value !== null ? h.value.find((c) => c.key === l.value) : null);
    return (c, d) => (s(), n("div", zd, [
      (s(), n("svg", {
        width: qe,
        height: qe,
        viewBox: `0 0 ${qe} ${qe}`,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`,
        class: "rg-pie__svg",
        onMouseleave: d[0] || (d[0] = (u) => l.value = null)
      }, [
        (s(!0), n(j, null, G(h.value, (u, b) => (s(), n("path", {
          key: u.key,
          d: a(u.start, u.end, l.value === u.key ? r : r - 3, i.value),
          class: oe(["rg-pie__slice", `rg-series-${u.slot}`, { "is-dim": l.value !== null && l.value !== u.key }]),
          style: Se({ "--rg-delay": `${b * 70}ms` }),
          onMouseenter: (T) => l.value = u.key
        }, null, 46, Gd))), 128)),
        t.donut ? (s(), n("g", Kd, [
          e("text", {
            x: qe / 2,
            y: qe / 2 - 6,
            "text-anchor": "middle",
            class: "rg-pie__total rg-num"
          }, w(A.value ? v(A.value.share) : F(xe)(g.value, t.value)), 9, Hd),
          e("text", {
            x: qe / 2,
            y: qe / 2 + 13,
            "text-anchor": "middle",
            class: "rg-chart__axis"
          }, w(A.value ? A.value.name.slice(0, 18) : "Total"), 9, Wd)
        ])) : C("", !0)
      ], 40, Bd)),
      e("ul", Yd, [
        (s(!0), n(j, null, G(h.value, (u) => (s(), n("li", {
          key: u.key,
          class: oe({ "is-hover": l.value === u.key }),
          onMouseenter: (b) => l.value = u.key,
          onMouseleave: d[1] || (d[1] = (b) => l.value = null)
        }, [
          e("i", {
            class: oe(`rg-swatch rg-series-${u.slot}`)
          }, null, 2),
          e("span", Qd, w(u.name), 1),
          e("b", Zd, w(u.text), 1),
          e("span", Xd, w(v(u.share)), 1)
        ], 42, Jd))), 128))
      ])
    ]));
  }
}, tc = { class: "rg-widget__head" }, lc = { class: "rg-widget__titles" }, sc = {
  key: 0,
  class: "rg-faint"
}, nc = ["aria-busy"], ac = {
  key: 0,
  class: "rg-widget__locked"
}, oc = { class: "rg-empty__icon" }, rc = {
  key: 1,
  class: "rg-widget__skeleton"
}, ic = {
  key: 2,
  class: "rg-widget__error"
}, uc = {
  key: 3,
  class: "rg-widget__empty rg-faint"
}, dc = {
  key: 0,
  class: "rg-kpis"
}, cc = {
  key: 6,
  class: "rg-widget__table"
}, gc = { class: "rg-grid" }, mc = {
  key: 0,
  class: "rg-sr-only"
}, Ct = {
  __name: "DashboardWidget",
  props: {
    widget: { type: Object, required: !0 },
    /** () => Promise<{ type, columns, rows }> */
    load: { type: Function, required: !0 },
    /** Bump to reload (filters changed). */
    version: { type: [Number, String], default: 0 }
  },
  setup(t, { expose: o }) {
    const l = t, r = $e("rg-widget-queue", null), i = B(null), g = B(null), h = B(l.widget.can_view === !1), a = B(!1);
    let v = 0;
    async function A() {
      if (l.widget.can_view === !1) {
        h.value = !0;
        return;
      }
      const D = ++v;
      a.value = !0, g.value = null;
      try {
        const _ = await (r ? r(() => l.load()) : l.load());
        D === v && (i.value = _);
      } catch (_) {
        D === v && ((_ == null ? void 0 : _.code) === "REPORT_FORBIDDEN" || (_ == null ? void 0 : _.status) === 403) ? h.value = !0 : D === v && (g.value = (_ == null ? void 0 : _.message) ?? "This widget could not load.");
      } finally {
        D === v && (a.value = !1);
      }
    }
    ye(() => [l.version, JSON.stringify(l.widget)], A, { immediate: !0 });
    const c = q(() => {
      var D;
      return Object.fromEntries((((D = i.value) == null ? void 0 : D.columns) ?? []).map((_) => [_.alias, _]));
    }), d = q(() => {
      var p;
      const D = c.value[l.widget.category];
      if (!D || D.grain || !["date", "datetime"].includes(D.type)) return D ?? null;
      const _ = (((p = i.value) == null ? void 0 : p.rows) ?? []).map((y) => y[D.alias]).filter((y) => y != null);
      return _.length > 1 && _.every((y) => /^\d{4}-\d{2}-01/.test(String(y))) ? { ...D, grain: "month" } : D;
    }), u = q(() => (l.widget.values ?? []).map((D) => c.value[D]).filter(Boolean)), b = q(() => i.value && i.value.rows.length === 0), T = q(() => {
      var D;
      return ((D = i.value) == null ? void 0 : D.columns) ?? [];
    });
    return o({ reload: A }), (D, _) => {
      var f;
      return s(), n("article", {
        class: oe(["rg-widget", [`rg-widget--${t.widget.type}`, `rg-widget--${t.widget.size ?? "md"}`]])
      }, [
        e("header", tc, [
          e("div", lc, [
            e("h3", null, w(t.widget.title || (((f = u.value[0]) == null ? void 0 : f.label) ?? "Widget")), 1),
            t.widget.report_name ? (s(), n("small", sc, w(t.widget.report_name), 1)) : C("", !0)
          ]),
          pt(D.$slots, "actions")
        ]),
        e("div", {
          class: "rg-widget__body",
          "aria-busy": a.value ? "true" : "false"
        }, [
          h.value ? (s(), n("div", ac, [
            e("span", oc, [
              O(P, { name: "lock" })
            ]),
            e("span", null, [
              _[0] || (_[0] = N("You need access to ", -1)),
              e("b", null, w(t.widget.report_name ?? "its report"), 1),
              _[1] || (_[1] = N(" to see this.", -1))
            ])
          ])) : a.value && !i.value ? (s(), n("div", rc, [
            (s(!0), n(j, null, G(t.widget.type === "kpi" ? 2 : 5, (p) => (s(), n("span", {
              key: p,
              class: "rg-skeleton",
              style: Se({ width: `${40 + p * 29 % 55}%` })
            }, null, 4))), 128))
          ])) : g.value ? (s(), n("p", ic, [
            O(P, {
              name: "alert",
              small: ""
            }),
            N(" " + w(g.value), 1)
          ])) : b.value ? (s(), n("p", uc, "No data for these filters.")) : i.value ? (s(), n(j, { key: 4 }, [
            e("div", {
              class: oe({ "rg-widget__stale": a.value })
            }, [
              t.widget.type === "kpi" ? (s(), n("div", dc, [
                (s(!0), n(j, null, G(u.value, (p) => {
                  var y;
                  return s(), ae(Ku, {
                    key: p.alias,
                    label: u.value.length > 1 || !t.widget.title ? p.label : "",
                    value: ((y = i.value.rows[0]) == null ? void 0 : y[p.alias]) ?? null,
                    column: p
                  }, null, 8, ["label", "value", "column"]);
                }), 128))
              ])) : t.widget.type === "bar" && d.value && u.value[0] ? (s(), ae(sd, {
                key: 1,
                rows: i.value.rows,
                category: d.value,
                value: u.value[0]
              }, null, 8, ["rows", "category", "value"])) : t.widget.type === "column" && d.value && u.value[0] ? (s(), ae(jd, {
                key: 2,
                rows: i.value.rows,
                category: d.value,
                value: u.value[0]
              }, null, 8, ["rows", "category", "value"])) : ["line", "area"].includes(t.widget.type) && d.value && u.value.length ? (s(), ae($d, {
                key: 3,
                rows: i.value.rows,
                category: d.value,
                values: u.value,
                area: t.widget.type === "area"
              }, null, 8, ["rows", "category", "values", "area"])) : ["pie", "donut"].includes(t.widget.type) && d.value && u.value[0] ? (s(), ae(ec, {
                key: 4,
                rows: i.value.rows,
                category: d.value,
                value: u.value[0],
                donut: t.widget.type === "donut",
                parts: t.widget.top ?? 6
              }, null, 8, ["rows", "category", "value", "donut", "parts"])) : t.widget.type === "share" && d.value && u.value[0] ? (s(), ae(Ed, {
                key: 5,
                rows: i.value.rows,
                category: d.value,
                value: u.value[0],
                parts: t.widget.top ?? 6
              }, null, 8, ["rows", "category", "value", "parts"])) : t.widget.type === "table" ? (s(), n("div", cc, [
                e("table", gc, [
                  e("thead", null, [
                    e("tr", null, [
                      (s(!0), n(j, null, G(T.value, (p) => (s(), n("th", {
                        key: p.alias,
                        class: oe({ "rg-num": F(Ze)(p) })
                      }, w(p.label), 3))), 128))
                    ])
                  ]),
                  e("tbody", null, [
                    (s(!0), n(j, null, G(i.value.rows, (p, y) => (s(), n("tr", {
                      key: y,
                      class: "rg-row"
                    }, [
                      (s(!0), n(j, null, G(T.value, (E) => (s(), n("td", {
                        key: E.alias,
                        class: oe({ "rg-num": F(Ze)(E) })
                      }, w(F(xe)(p[E.alias], E)), 3))), 128))
                    ]))), 128))
                  ])
                ])
              ])) : C("", !0)
            ], 2),
            t.widget.type !== "table" && !h.value ? (s(), n("table", mc, [
              e("caption", null, w(t.widget.title), 1),
              e("thead", null, [
                e("tr", null, [
                  (s(!0), n(j, null, G(T.value, (p) => (s(), n("th", {
                    key: p.alias
                  }, w(p.label), 1))), 128))
                ])
              ]),
              e("tbody", null, [
                (s(!0), n(j, null, G(i.value.rows, (p, y) => (s(), n("tr", { key: y }, [
                  (s(!0), n(j, null, G(T.value, (E) => (s(), n("td", {
                    key: E.alias
                  }, w(F(xe)(p[E.alias], E)), 1))), 128))
                ]))), 128))
              ])
            ])) : C("", !0)
          ], 64)) : C("", !0)
        ], 8, nc)
      ], 2);
    };
  }
}, pc = { class: "rg-publish" }, vc = ["for"], fc = ["id", "value"], bc = ["value"], hc = { class: "rg-publish__field" }, yc = {
  class: "rg-widget-types",
  role: "group",
  "aria-label": "Widget type"
}, $c = ["aria-pressed", "onClick"], _c = ["for"], kc = ["id"], wc = ["value"], xc = {
  key: 2,
  class: "rg-publish__field"
}, Cc = {
  key: 0,
  class: "rg-faint"
}, Sc = { class: "rg-publish__roles" }, Mc = ["aria-pressed", "onClick"], Tc = {
  key: 0,
  class: "rg-faint"
}, Ec = { class: "rg-widget-dialog__row" }, Ac = ["for"], Oc = ["id"], Rc = ["for"], Dc = ["id", "max"], Lc = ["for"], Nc = ["id"], Vc = ["value"], Ml = {
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
  setup(t, { emit: o }) {
    const l = t, r = o, i = [["sm", "Small"], ["md", "Half"], ["lg", "Two thirds"], ["full", "Full width"]], g = q(() => kl.includes(l.widget.type)), h = q(() => ["line", "area"].includes(l.widget.type)), a = q(() => ["pie", "donut", "share"].includes(l.widget.type));
    function v(d) {
      Object.assign(l.widget, wl(l.widget, d, { resize: !0 })), zt(l.widget, l.columns);
    }
    function A(d) {
      const u = l.widget;
      g.value ? u.values = [d] : u.values = u.values.includes(d) ? u.values.filter((b) => b !== d) : [...u.values, d];
    }
    function c(d) {
      Object.assign(l.widget, { report: d, category: null, values: [] }), r("report", d);
    }
    return (d, u) => (s(), n("div", pc, [
      t.reports ? (s(), n("label", {
        key: 0,
        class: "rg-publish__field",
        for: `${t.idPrefix}-report`
      }, [
        u[6] || (u[6] = e("span", null, "Report", -1)),
        e("select", {
          id: `${t.idPrefix}-report`,
          class: "rg-input",
          value: t.widget.report,
          onChange: u[0] || (u[0] = (b) => c(b.target.value))
        }, [
          u[5] || (u[5] = e("option", {
            value: "",
            disabled: ""
          }, "Pick a report", -1)),
          (s(!0), n(j, null, G(t.reports, (b) => (s(), n("option", {
            key: b.uuid,
            value: b.uuid
          }, w(b.name), 9, bc))), 128))
        ], 40, fc)
      ], 8, vc)) : C("", !0),
      e("div", hc, [
        u[7] || (u[7] = e("span", null, "Show as", -1)),
        e("div", yc, [
          (s(!0), n(j, null, G(F(_l), (b) => (s(), n("button", {
            key: b.value,
            type: "button",
            class: "rg-widget-type",
            "aria-pressed": t.widget.type === b.value,
            onClick: (T) => v(b.value)
          }, [
            O(P, {
              name: b.icon,
              small: ""
            }, null, 8, ["name"]),
            e("b", null, w(b.label), 1),
            e("small", null, w(b.hint), 1)
          ], 8, $c))), 128))
        ])
      ]),
      ["kpi", "table"].includes(t.widget.type) ? C("", !0) : (s(), n("label", {
        key: 1,
        class: "rg-publish__field",
        for: `${t.idPrefix}-category`
      }, [
        e("span", null, w(h.value ? "Over" : "By"), 1),
        se(e("select", {
          id: `${t.idPrefix}-category`,
          "onUpdate:modelValue": u[1] || (u[1] = (b) => t.widget.category = b),
          class: "rg-input"
        }, [
          u[8] || (u[8] = e("option", {
            value: null,
            disabled: ""
          }, "Pick a column", -1)),
          (s(!0), n(j, null, G(t.columns.dims, (b) => (s(), n("option", {
            key: b.as,
            value: b.as
          }, w(b.label), 9, wc))), 128))
        ], 8, kc), [
          [Re, t.widget.category]
        ])
      ], 8, _c)),
      t.widget.type !== "table" ? (s(), n("fieldset", xc, [
        e("legend", null, [
          N(w(g.value ? "Number" : "Numbers"), 1),
          h.value ? (s(), n("small", Cc, " · pick numbers of the same scale: they share one axis")) : C("", !0)
        ]),
        e("div", Sc, [
          (s(!0), n(j, null, G(t.columns.nums, (b) => (s(), n("button", {
            key: b.as,
            type: "button",
            class: "rg-publish__role",
            "aria-pressed": t.widget.values.includes(b.as),
            onClick: (T) => A(b.as)
          }, [
            O(P, {
              name: t.widget.values.includes(b.as) ? "check" : "plus",
              small: ""
            }, null, 8, ["name"]),
            N(w(b.label), 1)
          ], 8, Mc))), 128)),
          t.columns.loading ? (s(), n("span", Tc, [
            O(P, {
              name: "loader",
              spin: "",
              small: ""
            }),
            u[9] || (u[9] = N(" Loading columns…", -1))
          ])) : C("", !0)
        ])
      ])) : C("", !0),
      e("div", Ec, [
        e("label", {
          class: "rg-publish__field",
          for: `${t.idPrefix}-title`
        }, [
          u[10] || (u[10] = e("span", null, "Title", -1)),
          se(e("input", {
            id: `${t.idPrefix}-title`,
            "onUpdate:modelValue": u[2] || (u[2] = (b) => t.widget.title = b),
            class: "rg-input",
            maxlength: "160",
            placeholder: "From the numbers"
          }, null, 8, Oc), [
            [ce, t.widget.title]
          ])
        ], 8, Ac),
        t.widget.type !== "kpi" ? (s(), n("label", {
          key: 0,
          class: "rg-publish__field",
          for: `${t.idPrefix}-top`
        }, [
          e("span", null, w(h.value ? "Points" : a.value ? "Parts" : "Rows"), 1),
          se(e("input", {
            id: `${t.idPrefix}-top`,
            "onUpdate:modelValue": u[3] || (u[3] = (b) => t.widget.top = b),
            class: "rg-input",
            type: "number",
            min: "1",
            max: a.value ? 12 : h.value ? 400 : 50
          }, null, 8, Dc), [
            [
              ce,
              t.widget.top,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, Rc)) : C("", !0),
        e("label", {
          class: "rg-publish__field",
          for: `${t.idPrefix}-size`
        }, [
          u[11] || (u[11] = e("span", null, "Size", -1)),
          se(e("select", {
            id: `${t.idPrefix}-size`,
            "onUpdate:modelValue": u[4] || (u[4] = (b) => t.widget.size = b),
            class: "rg-input"
          }, [
            (s(), n(j, null, G(i, ([b, T]) => e("option", {
              key: b,
              value: b
            }, w(T), 9, Vc)), 64))
          ], 8, Nc), [
            [Re, t.widget.size]
          ])
        ], 8, Lc)
      ])
    ]));
  }
}, Fc = {
  key: 0,
  class: "rg-pin__done"
}, Pc = { class: "rg-empty__icon" }, Uc = {
  key: 0,
  class: "rg-widget-dialog__preview"
}, Ic = { class: "rg-publish__field rg-pin__target" }, qc = ["value"], jc = {
  key: 1,
  class: "rg-publish__error",
  role: "alert"
}, zc = ["disabled"], Gt = {
  __name: "PinToDashboard",
  props: {
    report: { type: String, required: !0 },
    reportName: { type: String, default: "" }
  },
  emits: ["close", "pinned", "open-dashboard"],
  setup(t, { emit: o }) {
    const l = t, r = o, { api: i } = Pe(), g = $e("rg-theme", "light"), h = be({ id: "preview", type: "bar", title: "", report: l.report, category: null, values: [], top: 10, size: "md" }), a = be({ dims: [], nums: [], loading: !0 }), v = B([]), A = B("new"), c = B(l.reportName ? `${l.reportName} dashboard` : "New dashboard"), d = be({ saving: !1, error: null, done: null });
    Me(async () => {
      try {
        const [_, f] = await Promise.all([i.reports.view(l.report), i.dashboards.list().catch(() => [])]), p = _.fields ?? [];
        Object.assign(a, xl(p)), a.dims.length || Object.assign(h, { type: "kpi", size: "sm" }), zt(h, a), v.value = f.filter((y) => y.is_owner), v.value.length && (A.value = v.value[0].uuid);
      } catch (_) {
        d.error = _.message;
      } finally {
        a.loading = !1;
      }
    });
    const u = q(() => h.type === "table" || h.values.length > 0 && (h.type === "kpi" || !!h.category)), b = q(() => JSON.stringify(h));
    function T() {
      var p;
      const { id: _, ...f } = h;
      return (p = f.title) != null && p.trim() || (f.title = f.values.map((y) => {
        var E;
        return ((E = a.nums.find((x) => x.as === y)) == null ? void 0 : E.label) ?? y;
      }).join(", ") || l.reportName || "Widget"), f;
    }
    async function D() {
      d.saving = !0, d.error = null;
      try {
        const _ = A.value === "new" ? await i.dashboards.create({ name: c.value.trim() || "New dashboard", layout: { widgets: [{ id: "w1", ...T() }] } }) : await i.dashboards.pin(A.value, T());
        d.done = _, r("pinned", _);
      } catch (_) {
        d.error = _.message;
      } finally {
        d.saving = !1;
      }
    }
    return (_, f) => (s(), ae(We, {
      title: d.done ? "Pinned" : `Pin “${t.reportName}” to a dashboard`,
      class: "rg-widget-dialog",
      "data-rg-theme": F(g),
      onClose: f[6] || (f[6] = (p) => r("close"))
    }, {
      footer: ue(() => [
        d.done ? (s(), n(j, { key: 0 }, [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: f[3] || (f[3] = (p) => r("close"))
          }, "Close"),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: f[4] || (f[4] = (p) => r("open-dashboard", d.done.uuid))
          }, [
            O(P, {
              name: "view",
              small: ""
            }),
            f[12] || (f[12] = N(" Open dashboard", -1))
          ])
        ], 64)) : (s(), n(j, { key: 1 }, [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: f[5] || (f[5] = (p) => r("close"))
          }, "Cancel"),
          e("button", {
            type: "submit",
            form: "rg-pin-form",
            class: "rg-btn rg-btn--primary",
            disabled: !u.value || d.saving
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            N(" " + w(d.saving ? "Pinning…" : "Pin"), 1)
          ], 8, zc)
        ], 64))
      ]),
      default: ue(() => [
        d.done ? (s(), n("div", Fc, [
          e("span", Pc, [
            O(P, { name: "check" })
          ]),
          e("p", null, [
            f[7] || (f[7] = N("Added to ", -1)),
            e("b", null, w(d.done.name), 1),
            f[8] || (f[8] = N(".", -1))
          ])
        ])) : (s(), n("form", {
          key: 1,
          id: "rg-pin-form",
          class: "rg-publish",
          onSubmit: f[2] || (f[2] = ge((p) => u.value && D(), ["prevent"]))
        }, [
          O(Ml, {
            widget: h,
            columns: a,
            "id-prefix": "rg-pin"
          }, null, 8, ["widget", "columns"]),
          u.value ? (s(), n("div", Uc, [
            f[9] || (f[9] = e("span", { class: "rg-faint" }, "Preview", -1)),
            O(Ct, {
              widget: { ...h, size: "full" },
              load: () => F(i).dashboards.preview(h),
              version: b.value
            }, null, 8, ["widget", "load", "version"])
          ])) : C("", !0),
          e("div", Ic, [
            f[11] || (f[11] = e("span", null, "Add to", -1)),
            se(e("select", {
              id: "rg-pin-target",
              "onUpdate:modelValue": f[0] || (f[0] = (p) => A.value = p),
              class: "rg-input"
            }, [
              (s(!0), n(j, null, G(v.value, (p) => (s(), n("option", {
                key: p.uuid,
                value: p.uuid
              }, w(p.name) + " (" + w(p.widgets_count) + " widgets)", 9, qc))), 128)),
              f[10] || (f[10] = e("option", { value: "new" }, "A new dashboard…", -1))
            ], 512), [
              [Re, A.value]
            ]),
            A.value === "new" ? se((s(), n("input", {
              key: 0,
              id: "rg-pin-name",
              "onUpdate:modelValue": f[1] || (f[1] = (p) => c.value = p),
              class: "rg-input",
              maxlength: "255",
              "aria-label": "New dashboard name"
            }, null, 512)), [
              [ce, c.value]
            ]) : C("", !0)
          ]),
          d.error ? (s(), n("p", jc, w(d.error), 1)) : C("", !0)
        ], 32))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, Bc = ["data-rg-theme"], Gc = { class: "rg-topbar" }, Kc = { class: "rg-topbar__title" }, Hc = { class: "rg-topbar__meta" }, Wc = { class: "rg-root-chip" }, Yc = { key: 0 }, Jc = {
  key: 1,
  class: "rg-badge rg-badge--success"
}, Qc = { class: "rg-topbar__actions" }, Zc = ["disabled"], Xc = ["disabled"], eg = {
  key: 0,
  class: "rg-builder__body"
}, tg = { class: "rg-explorer" }, lg = { class: "rg-skeleton-list" }, sg = {
  key: 1,
  class: "rg-builder__body"
}, ng = {
  class: "rg-explorer rg-catalog",
  "aria-label": "Reports"
}, ag = { class: "rg-explorer__head" }, og = { class: "rg-search" }, rg = { class: "rg-catalog__list" }, ig = {
  key: 0,
  class: "rg-list__empty"
}, ug = ["aria-expanded", "disabled", "onClick"], dg = {
  key: 0,
  class: "rg-faint"
}, cg = {
  key: 1,
  class: "rg-faint"
}, gg = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, mg = {
  key: 0,
  class: "rg-catalog__fields"
}, pg = {
  key: 0,
  class: "rg-faint"
}, vg = {
  key: 1,
  class: "rg-catalog__error"
}, fg = ["checked", "onChange"], bg = {
  key: 0,
  class: "rg-faint"
}, hg = { class: "rg-builder__main" }, yg = { class: "rg-combined__settings" }, $g = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "One row per"
}, _g = ["aria-pressed"], kg = ["aria-pressed"], wg = {
  class: "rg-field-inline",
  for: "rg-combined-period"
}, xg = ["value"], Cg = { class: "rg-field-inline" }, Sg = { class: "rg-combined__columns" }, Mg = {
  class: "rg-combined__base",
  role: "group",
  "aria-label": "Structure columns"
}, Tg = ["aria-pressed", "onClick"], Eg = ["onDragstart", "onDrop"], Ag = { class: "rg-combined__text" }, Og = ["aria-label", "onKeydown"], Rg = ["onClick"], Dg = { class: "rg-faint" }, Lg = ["aria-label", "onClick"], Ng = ["aria-label", "disabled", "onClick"], Vg = ["aria-label", "onClick"], Fg = ["disabled"], Pg = {
  class: "rg-results",
  "aria-label": "Results"
}, Ug = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, Ig = { key: 0 }, qg = { class: "rg-num" }, jg = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, zg = {
  key: 2,
  class: "rg-faint"
}, Bg = {
  key: 0,
  class: "rg-errorbox",
  role: "alert"
}, Gg = { class: "rg-errorbox__title" }, Kg = {
  class: "rg-publish__field",
  for: "rg-combined-formula-label"
}, Hg = {
  class: "rg-publish__field",
  for: "rg-combined-formula-text"
}, Wg = { class: "rg-publish__field" }, Yg = { class: "rg-token-list" }, Jg = ["title", "onClick"], Qg = ["disabled"], Zg = {
  __name: "CombinedBuilder",
  props: {
    /** Saved combined report to open (from api.reports.get), or null for a new one. */
    report: { type: Object, default: null },
    theme: { type: String, default: "light" }
  },
  emits: ["saved", "published", "back", "open-dashboard"],
  setup(t, { emit: o }) {
    const l = t, r = o, i = B(!1), { api: g } = Pe(), h = St(), a = Su(g, h);
    De(Ee, a), $e("rg-theme", null) || De("rg-theme", l.theme);
    const v = [
      ["this_month", "This month"],
      ["last_month", "Last month"],
      ["this_quarter", "This quarter"],
      ["last_quarter", "Last quarter"],
      ["this_year", "This year"],
      ["last_year", "Last year"],
      ["last_30_days", "Last 30 days"]
    ], A = { ...Nt, percent: "hash" }, c = q(() => a.state.draft), d = B(""), u = B(/* @__PURE__ */ new Set()), b = B(null), T = B(!1), D = B(null), _ = B(null), f = B(null), p = q(() => {
      const k = d.value.trim().toLowerCase(), m = /* @__PURE__ */ new Map();
      for (const S of a.state.reports) {
        if (k && !S.label.toLowerCase().includes(k) && !(S.description ?? "").toLowerCase().includes(k)) continue;
        const ee = S.group ?? "Reports";
        m.has(ee) || m.set(ee, []), m.get(ee).push(S);
      }
      return [...m];
    }), y = q(() => new Set(c.value.fields.filter((k) => k.report).map((k) => k.report))), E = q(() => c.value.fields.map((k) => ({ uid: k.uid, as: k.as, label: k.label ?? k.as })));
    function x(k) {
      return k.levels.includes(c.value.level);
    }
    function M(k) {
      const m = new Set(u.value);
      m.has(k.key) ? m.delete(k.key) : (m.add(k.key), a.loadFields(k.key)), u.value = m;
    }
    function $(k) {
      var m;
      return k.base ? "Structure" : k.formula ? "Formula" : ((m = a.reportsByKey.value[k.report]) == null ? void 0 : m.label) ?? k.report;
    }
    function W(k) {
      _.value = { uid: k.uid, label: k.label ?? k.as };
    }
    function re() {
      var k, m;
      (m = (k = _.value) == null ? void 0 : k.label) != null && m.trim() && a.updateColumn(_.value.uid, { label: _.value.label.trim() }), _.value = null;
    }
    function ke(k) {
      f.value && (a.moveColumn(f.value, c.value.fields.findIndex((m) => m.uid === k)), f.value = null);
    }
    function le() {
      var m;
      const k = D.value;
      (m = k == null ? void 0 : k.formula) != null && m.trim() && (k.uid ? a.updateColumn(k.uid, { label: k.label || "Formula", formula: k.formula.trim() }) : a.addFormula({ label: k.label, formula: k.formula.trim() }), D.value = null);
    }
    function L(k) {
      D.value.formula = `${D.value.formula ?? ""}${D.value.formula && !/\s$/.test(D.value.formula) ? " " : ""}${k}`;
    }
    function Q(k) {
      return g.contextOptions("lines", { search: k });
    }
    function I(k) {
      r("saved", k);
    }
    Me(() => a.init(l.report));
    const R = {
      REPORT_FAILED: "One of the reports could not run",
      DATASET_FORBIDDEN: "No access",
      LEVEL_UNSUPPORTED: "Not available at this level",
      UNKNOWN_FIELD: "Check the formula",
      INVALID_FORMULA: "Check the formula"
    };
    return (k, m) => (s(), n("div", {
      class: "rg-root rg-combined",
      "data-rg-theme": t.theme
    }, [
      e("header", Gc, [
        e("div", Kc, [
          m[32] || (m[32] = e("label", {
            class: "rg-sr-only",
            for: "rg-combined-name"
          }, "Report name", -1)),
          se(e("input", {
            id: "rg-combined-name",
            "onUpdate:modelValue": m[0] || (m[0] = (S) => c.value.name = S),
            class: "rg-input rg-input--bare rg-name-input",
            maxlength: "255"
          }, null, 512), [
            [ce, c.value.name]
          ]),
          e("div", Hc, [
            e("span", Wc, [
              O(P, {
                name: "table",
                small: ""
              }),
              m[29] || (m[29] = N(" Combined report, one row per ", -1)),
              e("b", null, w(c.value.level), 1),
              c.value.uuid ? C("", !0) : (s(), n("button", {
                key: 0,
                type: "button",
                onClick: m[1] || (m[1] = (S) => r("back"))
              }, "change type"))
            ]),
            F(a).dirty.value ? (s(), n("span", Yc, [...m[30] || (m[30] = [
              e("i", {
                class: "rg-dot",
                "aria-hidden": "true"
              }, null, -1),
              N(" Unsaved changes", -1)
            ])])) : C("", !0),
            c.value.published ? (s(), n("span", Jc, [
              O(P, {
                name: "globe",
                small: ""
              }),
              m[31] || (m[31] = N(" Published", -1))
            ])) : C("", !0)
          ])
        ]),
        e("div", Qc, [
          e("button", {
            type: "button",
            class: "rg-btn",
            disabled: !F(a).runnable.value || F(a).state.running,
            onClick: m[2] || (m[2] = (S) => F(a).run())
          }, [
            O(P, {
              name: "play",
              small: ""
            }),
            m[33] || (m[33] = N(" Run", -1))
          ], 8, Zc),
          O(It, {
            run: F(a).exportReport,
            disabled: !F(a).runnable.value
          }, null, 8, ["run", "disabled"]),
          m[37] || (m[37] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
          c.value.uuid ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn",
            title: "Add a chart or number from this report to a dashboard",
            onClick: m[3] || (m[3] = (S) => i.value = !0)
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            m[34] || (m[34] = N(" Pin", -1))
          ])) : C("", !0),
          c.value.uuid && c.value.canPublish ? (s(), n("button", {
            key: 1,
            type: "button",
            class: "rg-btn",
            onClick: m[4] || (m[4] = (S) => T.value = !0)
          }, [
            O(P, {
              name: "globe",
              small: ""
            }),
            N(" " + w(c.value.published ? "Publishing" : "Publish"), 1)
          ])) : C("", !0),
          c.value.uuid ? (s(), n("button", {
            key: 2,
            type: "button",
            class: "rg-btn",
            onClick: m[5] || (m[5] = (S) => b.value = { copy: !0 })
          }, [
            O(P, {
              name: "copy",
              small: ""
            }),
            m[35] || (m[35] = N(" Save a copy", -1))
          ])) : C("", !0),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            disabled: !F(a).runnable.value || F(a).state.saving || c.value.uuid && !c.value.canEdit,
            onClick: m[6] || (m[6] = (S) => b.value = { copy: !1 })
          }, [
            O(P, {
              name: "save",
              small: ""
            }),
            m[36] || (m[36] = N(" Save ", -1))
          ], 8, Xc)
        ])
      ]),
      F(a).state.loading ? (s(), n("div", eg, [
        e("aside", tg, [
          e("div", lg, [
            (s(), n(j, null, G(8, (S) => e("div", {
              key: S,
              class: "rg-skeleton"
            })), 64))
          ])
        ]),
        m[38] || (m[38] = e("main", { class: "rg-builder__main" }, null, -1))
      ])) : (s(), n("div", sg, [
        e("aside", ng, [
          e("div", ag, [
            e("label", og, [
              m[39] || (m[39] = e("span", { class: "rg-sr-only" }, "Search reports", -1)),
              O(P, { name: "search" }),
              se(e("input", {
                "onUpdate:modelValue": m[7] || (m[7] = (S) => d.value = S),
                class: "rg-input",
                type: "search",
                placeholder: "Search reports",
                autocomplete: "off"
              }, null, 512), [
                [ce, d.value]
              ])
            ])
          ]),
          e("div", rg, [
            F(a).state.reports.length ? C("", !0) : (s(), n("p", ig, "No existing reports can be combined yet.")),
            (s(!0), n(j, null, G(p.value, ([S, ee]) => (s(), n("section", {
              key: S,
              class: "rg-catalog__group"
            }, [
              e("h3", null, w(S), 1),
              (s(!0), n(j, null, G(ee, (ne) => (s(), n("article", {
                key: ne.key,
                class: oe(["rg-catalog__report", { "is-open": u.value.has(ne.key), "is-used": y.value.has(ne.key), "is-off": !x(ne) }])
              }, [
                e("button", {
                  type: "button",
                  class: "rg-catalog__head",
                  "aria-expanded": u.value.has(ne.key),
                  disabled: !x(ne),
                  onClick: (me) => M(ne)
                }, [
                  O(P, {
                    name: "chevron",
                    small: "",
                    class: "rg-catalog__chev"
                  }),
                  e("span", null, [
                    e("b", null, w(ne.label), 1),
                    x(ne) ? ne.description ? (s(), n("small", cg, w(ne.description), 1)) : C("", !0) : (s(), n("small", dg, "Per " + w(ne.levels.join(" / ")) + " only", 1))
                  ]),
                  y.value.has(ne.key) ? (s(), n("span", gg, "in use")) : C("", !0)
                ], 8, ug),
                O(tt, { name: "rg-swap" }, {
                  default: ue(() => {
                    var me, Ce, Ie;
                    return [
                      u.value.has(ne.key) ? (s(), n("ul", mg, [
                        (me = F(a).fieldsOf(ne.key)) != null && me.loading ? (s(), n("li", pg, [
                          O(P, {
                            name: "loader",
                            spin: "",
                            small: ""
                          }),
                          m[40] || (m[40] = N(" Reading its columns…", -1))
                        ])) : (Ce = F(a).fieldsOf(ne.key)) != null && Ce.error ? (s(), n("li", vg, w(F(a).fieldsOf(ne.key).error), 1)) : C("", !0),
                        (s(!0), n(j, null, G(((Ie = F(a).fieldsOf(ne.key)) == null ? void 0 : Ie.fields) ?? [], (Le) => (s(), n("li", {
                          key: Le.key
                        }, [
                          e("label", null, [
                            e("input", {
                              type: "checkbox",
                              class: "rg-check",
                              checked: F(a).hasField(ne.key, Le.key),
                              onChange: (rt) => F(a).toggleField(ne.key, Le)
                            }, null, 40, fg),
                            O(P, {
                              name: A[Le.type] ?? "text",
                              small: ""
                            }, null, 8, ["name"]),
                            e("span", null, w(Le.label), 1),
                            Le.type === "percent" ? (s(), n("small", bg, "%")) : C("", !0)
                          ])
                        ]))), 128))
                      ])) : C("", !0)
                    ];
                  }),
                  _: 2
                }, 1024)
              ], 2))), 128))
            ]))), 128))
          ])
        ]),
        e("main", hg, [
          e("div", yg, [
            e("div", $g, [
              e("button", {
                type: "button",
                "aria-pressed": c.value.level === "employee",
                onClick: m[8] || (m[8] = (S) => c.value.level = "employee")
              }, "Per employee", 8, _g),
              e("button", {
                type: "button",
                "aria-pressed": c.value.level === "division",
                onClick: m[9] || (m[9] = (S) => c.value.level = "division")
              }, "Per division", 8, kg)
            ]),
            e("label", wg, [
              O(P, {
                name: "calendar",
                small: ""
              }),
              m[42] || (m[42] = N(" Period ", -1)),
              se(e("select", {
                id: "rg-combined-period",
                "onUpdate:modelValue": m[10] || (m[10] = (S) => c.value.period = S),
                class: "rg-input",
                style: { width: "auto" }
              }, [
                (s(), n(j, null, G(v, ([S, ee]) => e("option", {
                  key: S,
                  value: S
                }, w(ee), 9, xg)), 64)),
                m[41] || (m[41] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 512), [
                [Re, c.value.period]
              ])
            ]),
            c.value.period === "custom" ? (s(), n(j, { key: 0 }, [
              se(e("input", {
                "onUpdate:modelValue": m[11] || (m[11] = (S) => c.value.from = S),
                class: "rg-input",
                type: "date",
                "aria-label": "From",
                style: { width: "auto" }
              }, null, 512), [
                [ce, c.value.from]
              ]),
              m[43] || (m[43] = e("span", { class: "rg-faint" }, "to", -1)),
              se(e("input", {
                "onUpdate:modelValue": m[12] || (m[12] = (S) => c.value.to = S),
                class: "rg-input",
                type: "date",
                "aria-label": "To",
                style: { width: "auto" }
              }, null, 512), [
                [ce, c.value.to]
              ])
            ], 64)) : C("", !0),
            e("div", Cg, [
              O(P, {
                name: "folder",
                small: ""
              }),
              m[44] || (m[44] = N(" Lines ", -1)),
              O(et, {
                modelValue: c.value.lines,
                "onUpdate:modelValue": m[13] || (m[13] = (S) => c.value.lines = S),
                label: "Lines",
                "all-label": "All my lines",
                load: Q
              }, null, 8, ["modelValue"])
            ])
          ]),
          e("div", Sg, [
            e("div", Mg, [
              (s(!0), n(j, null, G(F($l), (S) => (s(), n("button", {
                key: S.key,
                type: "button",
                class: "rg-chip-toggle",
                "aria-pressed": c.value.fields.some((ee) => ee.base === S.key),
                onClick: (ee) => F(a).toggleBase(S.key)
              }, w(S.label), 9, Tg))), 128))
            ]),
            O(je, {
              tag: "ol",
              name: "rg-list-move",
              class: "rg-combined__chips",
              "aria-label": "Columns"
            }, {
              default: ue(() => [
                (s(!0), n(j, null, G(c.value.fields, (S, ee) => {
                  var ne;
                  return s(), n("li", {
                    key: S.uid,
                    class: oe(["rg-combined__chip", { "is-formula": S.formula, "is-base": S.base, "is-dragging": f.value === S.uid }]),
                    draggable: "true",
                    onDragstart: (me) => f.value = S.uid,
                    onDragend: m[16] || (m[16] = (me) => f.value = null),
                    onDragover: m[17] || (m[17] = ge(() => {
                    }, ["prevent"])),
                    onDrop: ge((me) => ke(S.uid), ["prevent"])
                  }, [
                    m[45] || (m[45] = e("span", {
                      class: "rg-combined__grip",
                      "aria-hidden": "true"
                    }, "⋮⋮", -1)),
                    e("span", Ag, [
                      ((ne = _.value) == null ? void 0 : ne.uid) === S.uid ? se((s(), n("input", {
                        key: 0,
                        "onUpdate:modelValue": m[14] || (m[14] = (me) => _.value.label = me),
                        class: "rg-input rg-combined__rename",
                        "aria-label": `Rename ${S.label ?? S.as}`,
                        onKeydown: [
                          Ke(ge(re, ["prevent"]), ["enter"]),
                          m[15] || (m[15] = Ke((me) => _.value = null, ["escape"]))
                        ],
                        onBlur: re
                      }, null, 40, Og)), [
                        [ce, _.value.label]
                      ]) : (s(), n("button", {
                        key: 1,
                        type: "button",
                        class: "rg-linkish",
                        title: "Rename",
                        onClick: (me) => W(S)
                      }, w(S.label ?? S.as), 9, Rg)),
                      e("small", Dg, [
                        S.formula ? (s(), n(j, { key: 0 }, [
                          O(P, {
                            name: "fx",
                            small: ""
                          }),
                          N(" " + w(S.formula), 1)
                        ], 64)) : (s(), n(j, { key: 1 }, [
                          N(w($(S)), 1)
                        ], 64))
                      ])
                    ]),
                    S.formula ? (s(), n("button", {
                      key: 0,
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Edit ${S.label}`,
                      onClick: (me) => D.value = { uid: S.uid, label: S.label, formula: S.formula }
                    }, [
                      O(P, {
                        name: "fx",
                        small: ""
                      })
                    ], 8, Lg)) : C("", !0),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${S.label ?? S.as} left`,
                      disabled: ee === 0,
                      onClick: (me) => F(a).moveColumn(S.uid, ee - 1)
                    }, "‹", 8, Ng),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Remove ${S.label ?? S.as}`,
                      onClick: (me) => F(a).removeColumn(S.uid)
                    }, [
                      O(P, {
                        name: "x",
                        small: ""
                      })
                    ], 8, Vg)
                  ], 42, Eg);
                }), 128))
              ]),
              _: 1
            }),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm",
              disabled: c.value.fields.length < 2,
              onClick: m[18] || (m[18] = (S) => D.value = { label: "", formula: "" })
            }, [
              O(P, {
                name: "fx",
                small: ""
              }),
              m[46] || (m[46] = N(" Formula ", -1))
            ], 8, Fg)
          ]),
          e("section", Pg, [
            e("div", Ug, [
              F(a).state.running ? (s(), n("span", Ig, [
                O(P, {
                  name: "loader",
                  spin: "",
                  small: ""
                }),
                m[47] || (m[47] = N(" Running the reports…", -1))
              ])) : F(a).state.meta && !F(a).state.error ? (s(), n(j, { key: 1 }, [
                e("span", null, w(y.value.size) + " " + w(y.value.size === 1 ? "report" : "reports") + " combined", 1),
                e("span", qg, w(F(a).state.meta.duration_ms) + " ms", 1),
                F(a).state.meta.cached ? (s(), n("span", jg, "from cache")) : C("", !0)
              ], 64)) : F(a).runnable.value ? C("", !0) : (s(), n("span", zg, "Open a report on the left and tick the columns you want."))
            ]),
            e("div", null, [
              F(a).state.error ? (s(), n("div", Bg, [
                e("span", Gg, [
                  O(P, {
                    name: "alert",
                    small: ""
                  }),
                  N(w(R[F(a).state.error.code] ?? "This report cannot run yet"), 1)
                ]),
                e("span", null, w(F(a).state.error.message), 1)
              ])) : C("", !0)
            ]),
            O(qt)
          ])
        ])
      ])),
      D.value ? (s(), ae(We, {
        key: 2,
        title: D.value.uid ? "Edit formula" : "New formula",
        "data-rg-theme": t.theme,
        onClose: m[22] || (m[22] = (S) => D.value = null)
      }, {
        footer: ue(() => {
          var S;
          return [
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: m[21] || (m[21] = (ee) => D.value = null)
            }, "Cancel"),
            e("button", {
              type: "submit",
              form: "rg-combined-formula",
              class: "rg-btn rg-btn--primary",
              disabled: !((S = D.value.formula) != null && S.trim())
            }, w(D.value.uid ? "Update" : "Add"), 9, Qg)
          ];
        }),
        default: ue(() => [
          e("form", {
            id: "rg-combined-formula",
            class: "rg-publish",
            onSubmit: ge(le, ["prevent"])
          }, [
            e("label", Kg, [
              m[48] || (m[48] = e("span", null, "Column name", -1)),
              se(e("input", {
                id: "rg-combined-formula-label",
                "onUpdate:modelValue": m[19] || (m[19] = (S) => D.value.label = S),
                class: "rg-input",
                maxlength: "120",
                placeholder: "Sales per visit"
              }, null, 512), [
                [ce, D.value.label]
              ])
            ]),
            e("label", Hg, [
              m[49] || (m[49] = e("span", null, "Formula", -1)),
              se(e("textarea", {
                id: "rg-combined-formula-text",
                "onUpdate:modelValue": m[20] || (m[20] = (S) => D.value.formula = S),
                class: "rg-textarea rg-formula",
                placeholder: "ROUND(sales / visits, 2)",
                required: ""
              }, null, 512), [
                [ce, D.value.formula]
              ])
            ]),
            e("div", Wg, [
              m[50] || (m[50] = e("span", null, "Columns you can use", -1)),
              e("div", Yg, [
                (s(!0), n(j, null, G(E.value.filter((S) => S.uid !== D.value.uid), (S) => (s(), n("button", {
                  key: S.as,
                  type: "button",
                  class: "rg-chip-toggle",
                  title: S.label,
                  onClick: (ee) => L(S.as)
                }, w(S.as), 9, Jg))), 128))
              ]),
              m[51] || (m[51] = e("small", { class: "rg-faint" }, "+ − * / %, comparisons, IF, ROUND, ABS, COALESCE, NULLIF, GREATEST, LEAST, SAFE_DIVIDE. Dividing by zero gives an empty cell.", -1))
            ])
          ], 32)
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : C("", !0),
      i.value && c.value.uuid ? (s(), ae(Gt, {
        key: 3,
        report: c.value.uuid,
        "report-name": c.value.name,
        onClose: m[23] || (m[23] = (S) => i.value = !1),
        onOpenDashboard: m[24] || (m[24] = (S) => {
          i.value = !1, r("open-dashboard", S);
        })
      }, null, 8, ["report", "report-name"])) : C("", !0),
      b.value ? (s(), ae(yl, {
        key: 4,
        copy: b.value.copy,
        onClose: m[25] || (m[25] = (S) => b.value = null),
        onSaved: I
      }, null, 8, ["copy"])) : C("", !0),
      T.value ? (s(), ae(jt, {
        key: 5,
        uuid: c.value.uuid,
        name: c.value.name,
        onClose: m[26] || (m[26] = (S) => T.value = !1),
        onPublished: m[27] || (m[27] = (S) => {
          c.value.published = !0, r("published", S);
        }),
        onUnpublished: m[28] || (m[28] = (S) => {
          c.value.published = !1, r("published", S);
        })
      }, null, 8, ["uuid", "name"])) : C("", !0),
      O(Mt, {
        toasts: F(h),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, Bc));
  }
}, Xg = {
  class: "rg-muted",
  style: { margin: "0" }
}, em = ["onClick"], tm = {
  key: 0,
  class: "rg-badge rg-badge--warning"
}, lm = {
  __name: "PathDialog",
  setup(t) {
    const o = $e(Ee), l = $e("rg-theme", "light");
    return (r, i) => F(o).state.pathChoice ? (s(), ae(We, {
      key: 0,
      title: `How should ${F(o).state.pathChoice.dataset.label} connect to this report?`,
      "data-rg-theme": F(l),
      onClose: i[1] || (i[1] = (g) => F(o).state.pathChoice = null)
    }, {
      footer: ue(() => [
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: i[0] || (i[0] = (g) => F(o).state.pathChoice = null)
        }, "Cancel")
      ]),
      default: ue(() => [
        e("p", Xg, w(F(o).state.pathChoice.dataset.label) + " can be reached in more than one way, and each gives different numbers. ", 1),
        (s(!0), n(j, null, G(F(o).state.pathChoice.options, (g) => (s(), n("button", {
          key: g.path.join("."),
          type: "button",
          class: "rg-path-option",
          onClick: (h) => F(o).choosePath(g.path)
        }, [
          e("b", null, w(g.description), 1),
          g.multiplies_rows ? (s(), n("span", tm, "several per report row")) : C("", !0)
        ], 8, em))), 128))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"])) : C("", !0);
  }
}, sm = ["data-rg-theme"], nm = {
  key: 0,
  class: "rg-builder__body"
}, am = { class: "rg-explorer" }, om = { class: "rg-skeleton-list" }, rm = {
  key: 1,
  class: "rg-main"
}, im = {
  key: 2,
  class: "rg-builder__body"
}, um = { class: "rg-builder__main" }, dm = { class: "rg-shelves" }, cm = { class: "rg-shelf" }, gm = {
  key: 1,
  class: "rg-shelf__empty"
}, mm = {
  key: 2,
  style: { "margin-top": "6px" }
}, pm = { class: "rg-shelf" }, vm = {
  class: "rg-panel__controls",
  style: { gap: "16px", "padding-top": "4px" }
}, fm = {
  class: "rg-field-inline",
  for: "rg-opt-grouped",
  title: "Show rows as groups you open one level at a time"
}, bm = ["disabled"], hm = {
  class: "rg-field-inline",
  for: "rg-opt-subtotals"
}, ym = ["disabled"], Fv = {
  __name: "ReportBuilder",
  props: {
    /** uuid of a saved report to open; null starts a new one */
    reportId: { type: String, default: null },
    theme: { type: String, default: "light" }
  },
  emits: ["saved", "published", "open-dashboard"],
  setup(t, { emit: o }) {
    const l = t, r = o, i = B(!1), { api: g } = Pe(), h = St(), a = gn(g, h);
    De(Ee, a), De("rg-theme", l.theme);
    const v = B(null), A = B(null), c = B(!1), d = B(null), u = B(null), b = B(!1);
    De("rg-start-combined", b), De("rg-choose-combined", () => {
      u.value = null, d.value = "combined";
    });
    const T = B([]), D = B(!1);
    async function _(E) {
      var x;
      if (d.value = null, u.value = null, E)
        try {
          const M = await g.reports.get(E);
          if (((x = M.definition) == null ? void 0 : x.type) === "combined") {
            u.value = M, d.value = "combined";
            return;
          }
        } catch {
        }
      d.value = "topic", await a.init(E);
    }
    ye(() => l.reportId, (E) => _(E), { immediate: !1 }), Me(async () => {
      g.combine.reports().then((E) => b.value = E.length > 0).catch(() => {
      }), await _(l.reportId), document.addEventListener("keydown", f), g.reports.list({ scope: "mine" }).then((E) => T.value = E.folders ?? []).catch(() => {
      });
    }), Fe(() => {
      document.removeEventListener("keydown", f), a.cancelRunning();
    });
    function f(E) {
      var $;
      if (!(E.ctrlKey || E.metaKey)) return;
      const M = ["INPUT", "TEXTAREA", "SELECT"].includes(($ = document.activeElement) == null ? void 0 : $.tagName);
      E.key === "s" ? (E.preventDefault(), a.runnable.value && (A.value = { copy: !1 })) : E.key === "Enter" ? (E.preventDefault(), a.run()) : E.key.toLowerCase() === "z" && !M && (E.preventDefault(), E.shiftKey ? a.redo() : a.undo());
    }
    function p(E) {
      D.value = !1;
      try {
        const x = JSON.parse(E.dataTransfer.getData("application/x-rg"));
        x.kind === "field" && a.addField(x.dataset, x.field, "filters", null, x.path, null, x.label), x.kind === "item" && a.filterOnTotal(x.uid);
      } catch {
      }
    }
    function y(E) {
      r("saved", E);
    }
    return (E, x) => {
      var M;
      return d.value === "combined" ? (s(), ae(Zg, {
        key: ((M = u.value) == null ? void 0 : M.uuid) ?? "new",
        report: u.value,
        theme: t.theme,
        onSaved: y,
        onPublished: x[0] || (x[0] = ($) => r("published", $)),
        onOpenDashboard: x[1] || (x[1] = ($) => r("open-dashboard", $)),
        onBack: x[2] || (x[2] = ($) => {
          d.value = "topic", F(a).init(null);
        })
      }, null, 8, ["report", "theme"])) : (s(), n("div", {
        key: 1,
        class: "rg-root rg-builder",
        "data-rg-theme": t.theme
      }, [
        O(Ln, {
          onSave: x[3] || (x[3] = ($) => A.value = { copy: !1 }),
          onSaveCopy: x[4] || (x[4] = ($) => A.value = { copy: !0 }),
          onPublish: x[5] || (x[5] = ($) => c.value = !0),
          onPin: x[6] || (x[6] = ($) => i.value = !0)
        }),
        F(a).state.loading ? (s(), n("div", nm, [
          e("aside", am, [
            e("div", om, [
              (s(), n(j, null, G(10, ($) => e("div", {
                key: $,
                class: "rg-skeleton"
              })), 64))
            ])
          ]),
          x[21] || (x[21] = e("main", { class: "rg-builder__main" }, null, -1))
        ])) : F(a).state.draft.root ? (s(), n("div", im, [
          O(da),
          e("main", um, [
            e("div", dm, [
              O(nl, {
                shelf: "rows",
                title: "Rows",
                empty: "Drop fields to group by (lines, reps, months…)"
              }),
              O(nl, {
                shelf: "values",
                title: "Values",
                empty: "Drop numbers to total (amounts, number of visits…)",
                onEditFormula: x[8] || (x[8] = ($) => v.value = { item: $ })
              }, {
                default: ue(() => [
                  e("button", {
                    type: "button",
                    class: "rg-btn rg-btn--sm rg-btn--ghost",
                    onClick: x[7] || (x[7] = ($) => v.value = { item: null })
                  }, [
                    O(P, {
                      name: "fx",
                      small: ""
                    }),
                    x[22] || (x[22] = N(" Formula ", -1))
                  ])
                ]),
                _: 1
              }),
              e("div", cm, [
                x[23] || (x[23] = e("span", { class: "rg-shelf__title" }, "Filters", -1)),
                e("div", {
                  class: oe(["rg-shelf__drop", { "rg-shelf__drop--over": D.value }]),
                  style: { display: "block" },
                  "aria-label": "Filters shelf",
                  onDragover: x[10] || (x[10] = ($) => [...$.dataTransfer.types].includes("application/x-rg") && ($.preventDefault(), D.value = !0)),
                  onDragleave: x[11] || (x[11] = ge(($) => D.value = !1, ["self"])),
                  onDrop: ge(p, ["prevent"])
                }, [
                  F(a).state.draft.filters.items.length ? (s(), ae(ao, {
                    key: 0,
                    group: F(a).state.draft.filters
                  }, null, 8, ["group"])) : (s(), n("span", gm, "Drop a field to filter the rows, or a value to filter totals")),
                  F(a).state.draft.filters.items.length ? (s(), n("div", mm, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--sm rg-btn--ghost",
                      onClick: x[9] || (x[9] = ($) => F(a).addFilterGroup())
                    }, [
                      O(P, {
                        name: "plus",
                        small: ""
                      }),
                      N(" Add a group (" + w(F(a).state.draft.filters.boolean === "and" ? "any of" : "all of") + ") ", 1)
                    ])
                  ])) : C("", !0)
                ], 34)
              ]),
              e("div", pm, [
                x[26] || (x[26] = e("span", { class: "rg-shelf__title" }, "Options", -1)),
                e("div", vm, [
                  e("label", fm, [
                    se(e("input", {
                      id: "rg-opt-grouped",
                      "onUpdate:modelValue": x[12] || (x[12] = ($) => F(a).state.draft.grouped = $),
                      class: "rg-check",
                      type: "checkbox",
                      disabled: F(a).state.draft.rows.length < 2
                    }, null, 8, bm), [
                      [mt, F(a).state.draft.grouped]
                    ]),
                    x[24] || (x[24] = N(" Group rows (open level by level) ", -1))
                  ]),
                  e("label", hm, [
                    se(e("input", {
                      id: "rg-opt-subtotals",
                      "onUpdate:modelValue": x[13] || (x[13] = ($) => F(a).state.draft.subtotals = $),
                      class: "rg-check",
                      type: "checkbox",
                      disabled: !F(a).state.draft.values.length || F(a).grouped.value
                    }, null, 8, ym), [
                      [mt, F(a).state.draft.subtotals]
                    ]),
                    x[25] || (x[25] = N(" Subtotals ", -1))
                  ])
                ])
              ])
            ]),
            O(vi)
          ])
        ])) : (s(), n("main", rm, [
          O(Gn)
        ])),
        v.value ? (s(), ae(Yi, {
          key: 3,
          item: v.value.item,
          onClose: x[14] || (x[14] = ($) => v.value = null)
        }, null, 8, ["item"])) : C("", !0),
        i.value && F(a).state.draft.uuid ? (s(), ae(Gt, {
          key: 4,
          report: F(a).state.draft.uuid,
          "report-name": F(a).state.draft.name,
          onClose: x[15] || (x[15] = ($) => i.value = !1),
          onOpenDashboard: x[16] || (x[16] = ($) => {
            i.value = !1, r("open-dashboard", $);
          })
        }, null, 8, ["report", "report-name"])) : C("", !0),
        c.value ? (s(), ae(jt, {
          key: 5,
          uuid: F(a).state.draft.uuid,
          name: F(a).state.draft.name,
          onClose: x[17] || (x[17] = ($) => c.value = !1),
          onPublished: x[18] || (x[18] = ($) => {
            F(a).state.draft.published = !0, r("published", $);
          }),
          onUnpublished: x[19] || (x[19] = ($) => {
            F(a).state.draft.published = !1, r("published", $);
          })
        }, null, 8, ["uuid", "name"])) : C("", !0),
        A.value ? (s(), ae(yl, {
          key: 6,
          copy: A.value.copy,
          folders: T.value,
          onClose: x[20] || (x[20] = ($) => A.value = null),
          onSaved: y
        }, null, 8, ["copy", "folders"])) : C("", !0),
        O(lm),
        O(Mt, {
          toasts: F(h),
          "data-rg-theme": t.theme
        }, null, 8, ["toasts", "data-rg-theme"])
      ], 8, sm));
    };
  }
}, $m = ["data-rg-theme"], _m = { class: "rg-topbar" }, km = {
  key: 0,
  class: "rg-topbar__actions"
}, wm = {
  key: 0,
  class: "rg-library__filters"
}, xm = {
  class: "rg-tabs",
  role: "tablist"
}, Cm = ["aria-selected", "onClick"], Sm = {
  class: "rg-search",
  style: { width: "260px" }
}, Mm = {
  key: 0,
  class: "rg-tabs",
  "aria-label": "Folders"
}, Tm = ["aria-selected"], Em = ["aria-selected", "onClick"], Am = { class: "rg-library__list" }, Om = {
  key: 0,
  class: "rg-empty"
}, Rm = { class: "rg-empty__icon" }, Dm = {
  key: 1,
  class: "rg-skeleton-list"
}, Lm = {
  key: 2,
  class: "rg-empty"
}, Nm = { class: "rg-empty__icon" }, Vm = { class: "rg-report-row__title" }, Fm = ["onClick"], Pm = { class: "rg-report-row__meta" }, Um = { style: { display: "flex", gap: "6px", "align-items": "center" } }, Im = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, qm = {
  key: 1,
  class: "rg-badge rg-badge--info"
}, jm = { class: "rg-report-row__actions" }, zm = ["aria-label", "onClick"], Bm = {
  key: 4,
  class: "rg-empty"
}, Gm = { class: "rg-empty__icon" }, Km = { class: "rg-report-row__title" }, Hm = ["onClick"], Wm = { class: "rg-report-row__meta" }, Ym = { key: 0 }, Jm = {
  key: 1,
  class: "rg-faint",
  style: { overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap", "max-width": "420px" }
}, Qm = { style: { display: "flex", gap: "6px", "align-items": "center" } }, Zm = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, Xm = {
  key: 1,
  class: "rg-badge rg-badge--info"
}, ep = {
  key: 2,
  class: "rg-badge"
}, tp = { class: "rg-report-row__actions" }, lp = ["onClick"], sp = ["onClick"], np = ["aria-label", "onClick"], Pv = {
  __name: "ReportLibrary",
  props: { theme: { type: String, default: "light" } },
  emits: ["open", "create", "dashboard", "open-dashboard"],
  setup(t, { emit: o }) {
    const l = o, { api: r } = Pe(), i = St(), g = B("all"), h = B(""), a = B(null), v = B([]), A = B([]), c = B(!0), d = B(!1), u = B(null), b = [["all", "All"], ["mine", "Mine"], ["shared", "Shared with me"], ["dashboards", "Dashboards"]], T = B([]), D = q(() => g.value === "dashboards"), _ = q(() => {
      const M = h.value.trim().toLowerCase();
      return T.value.filter(($) => !M || $.name.toLowerCase().includes(M));
    });
    let f = null;
    async function p() {
      if (c.value = !0, g.value === "dashboards") {
        try {
          T.value = await r.dashboards.list();
        } catch (M) {
          i.error(M);
        } finally {
          c.value = !1;
        }
        return;
      }
      try {
        const M = await r.reports.list({ scope: g.value, search: h.value || void 0, folder: a.value || void 0 });
        v.value = M.data, a.value || (A.value = M.folders);
      } catch (M) {
        (M == null ? void 0 : M.status) === 403 ? d.value = !0 : i.error(M);
      } finally {
        c.value = !1;
      }
    }
    ye([g, a], p), ye(h, () => {
      clearTimeout(f), f = setTimeout(p, 250);
    }), Me(p);
    async function y(M) {
      try {
        const $ = await r.reports.duplicate(M.uuid);
        i.success(`Created "${$.name}".`), l("open", $.uuid);
      } catch ($) {
        i.error($);
      }
    }
    async function E(M) {
      if (u.value = null, M.widgets_count !== void 0) {
        try {
          await r.dashboards.remove(M.uuid), T.value = T.value.filter(($) => $.uuid !== M.uuid), i.success(`Deleted "${M.name}".`);
        } catch ($) {
          i.error($);
        }
        return;
      }
      try {
        await r.reports.remove(M.uuid), v.value = v.value.filter(($) => $.uuid !== M.uuid), i.success(`Deleted "${M.name}".`);
      } catch ($) {
        i.error($);
      }
    }
    const x = q(() => !c.value && (D.value ? !_.value.length : !v.value.length));
    return (M, $) => (s(), n("div", {
      class: "rg-root rg-library",
      "data-rg-theme": t.theme
    }, [
      e("header", _m, [
        $[8] || ($[8] = e("div", { class: "rg-topbar__title" }, [
          e("h1", null, "Reports"),
          e("div", { class: "rg-topbar__meta" }, [
            e("span", null, "Build a report from any connected data, save it, and share it.")
          ])
        ], -1)),
        d.value ? C("", !0) : (s(), n("div", km, [
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: $[0] || ($[0] = (W) => l("create"))
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            $[7] || ($[7] = N(" New report", -1))
          ])
        ]))
      ]),
      d.value ? C("", !0) : (s(), n("div", wm, [
        e("div", xm, [
          (s(), n(j, null, G(b, ([W, re]) => e("button", {
            key: W,
            type: "button",
            role: "tab",
            class: "rg-tab",
            "aria-selected": g.value === W ? "true" : "false",
            onClick: (ke) => g.value = W
          }, w(re), 9, Cm)), 64))
        ]),
        e("label", Sm, [
          $[9] || ($[9] = e("span", { class: "rg-sr-only" }, "Search reports", -1)),
          O(P, { name: "search" }),
          se(e("input", {
            id: "rg-library-search",
            "onUpdate:modelValue": $[1] || ($[1] = (W) => h.value = W),
            class: "rg-input",
            type: "search",
            placeholder: "Search reports",
            autocomplete: "off"
          }, null, 512), [
            [ce, h.value]
          ])
        ]),
        A.value.length && !D.value ? (s(), n("div", Mm, [
          e("button", {
            type: "button",
            class: "rg-tab",
            "aria-selected": a.value ? "false" : "true",
            onClick: $[2] || ($[2] = (W) => a.value = null)
          }, "All folders", 8, Tm),
          (s(!0), n(j, null, G(A.value, (W) => (s(), n("button", {
            key: W,
            type: "button",
            class: "rg-tab",
            "aria-selected": a.value === W ? "true" : "false",
            onClick: (re) => a.value = W
          }, [
            O(P, {
              name: "folder",
              small: ""
            }),
            N(" " + w(W), 1)
          ], 8, Em))), 128))
        ])) : C("", !0)
      ])),
      e("div", Am, [
        d.value ? (s(), n("div", Om, [
          e("div", Rm, [
            O(P, { name: "lock" })
          ]),
          $[10] || ($[10] = e("h2", null, "Reports are shared with you through the menu", -1)),
          $[11] || ($[11] = e("p", null, "You can open the reports and dashboards published to your role from the menu. Building new reports needs the permission to create them.", -1))
        ])) : c.value ? (s(), n("div", Dm, [
          (s(), n(j, null, G(5, (W) => e("div", {
            key: W,
            class: "rg-skeleton",
            style: { height: "44px" }
          })), 64))
        ])) : x.value && D.value ? (s(), n("div", Lm, [
          e("div", Nm, [
            O(P, { name: "view" })
          ]),
          e("h2", null, w(h.value ? "No dashboard matches" : "No dashboards yet"), 1),
          $[12] || ($[12] = e("p", null, [
            N("Open the Reports tab and press "),
            e("b", null, "Dashboard"),
            N(" on a report: its numbers become headline tiles and charts you can arrange.")
          ], -1))
        ])) : D.value ? (s(!0), n(j, { key: 3 }, G(_.value, (W) => (s(), n("article", {
          key: W.uuid,
          class: "rg-report-row"
        }, [
          e("div", Vm, [
            e("button", {
              type: "button",
              onClick: (re) => l("open-dashboard", W.uuid)
            }, [
              O(P, {
                name: "view",
                small: ""
              }),
              N(" " + w(W.name), 1)
            ], 8, Fm),
            e("div", Pm, [
              e("span", null, w(W.widgets_count) + " widgets", 1),
              e("span", null, "Updated " + w(F(al)(W.updated_at)), 1)
            ])
          ]),
          e("div", Um, [
            W.published ? (s(), n("span", Im, [
              O(P, {
                name: "globe",
                small: ""
              }),
              $[13] || ($[13] = N(" Published", -1))
            ])) : W.visibility === "public" ? (s(), n("span", qm, [
              O(P, {
                name: "globe",
                small: ""
              }),
              $[14] || ($[14] = N(" Everyone", -1))
            ])) : C("", !0)
          ]),
          e("div", jm, [
            W.is_owner ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost rg-btn--danger",
              "aria-label": `Delete ${W.name}`,
              onClick: (re) => u.value = W
            }, [
              O(P, {
                name: "trash",
                small: ""
              })
            ], 8, zm)) : C("", !0)
          ])
        ]))), 128)) : x.value ? (s(), n("div", Bm, [
          e("div", Gm, [
            O(P, { name: "table" })
          ]),
          e("h2", null, w(h.value || a.value ? "No report matches" : g.value === "shared" ? "Nothing shared with you yet" : "No reports yet"), 1),
          e("p", null, w(h.value || a.value ? "Try another search or folder." : "Start one: pick what it is about, then drag in the fields you need."), 1),
          !h.value && !a.value ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: $[3] || ($[3] = (W) => l("create"))
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            $[15] || ($[15] = N(" New report", -1))
          ])) : C("", !0)
        ])) : (s(!0), n(j, { key: 5 }, G(v.value, (W) => (s(), n("article", {
          key: W.uuid,
          class: "rg-report-row"
        }, [
          e("div", Km, [
            e("button", {
              type: "button",
              onClick: (re) => l("open", W.uuid)
            }, w(W.name), 9, Hm),
            e("div", Wm, [
              W.folder ? (s(), n("span", Ym, [
                O(P, {
                  name: "folder",
                  small: ""
                }),
                N(" " + w(W.folder), 1)
              ])) : C("", !0),
              e("span", null, w(W.fields_count) + " fields", 1),
              e("span", null, "Updated " + w(F(al)(W.updated_at)), 1),
              W.description ? (s(), n("span", Jm, w(W.description), 1)) : C("", !0)
            ])
          ]),
          e("div", Qm, [
            W.visibility === "public" ? (s(), n("span", Zm, [
              O(P, {
                name: "globe",
                small: ""
              }),
              $[16] || ($[16] = N(" Everyone", -1))
            ])) : W.shared ? (s(), n("span", Xm, [
              O(P, {
                name: "users",
                small: ""
              }),
              $[17] || ($[17] = N(" Shared", -1))
            ])) : C("", !0),
            W.is_owner ? C("", !0) : (s(), n("span", ep, w(W.can_edit ? "Can edit" : "View only"), 1))
          ]),
          e("div", tp, [
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              title: "Make a dashboard from this report",
              onClick: (re) => l("dashboard", W.uuid)
            }, [
              O(P, {
                name: "view",
                small: ""
              }),
              $[18] || ($[18] = N(" Dashboard", -1))
            ], 8, lp),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              onClick: (re) => y(W)
            }, [
              O(P, {
                name: "copy",
                small: ""
              }),
              $[19] || ($[19] = N(" Duplicate", -1))
            ], 8, sp),
            W.is_owner ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost rg-btn--danger",
              "aria-label": `Delete ${W.name}`,
              onClick: (re) => u.value = W
            }, [
              O(P, {
                name: "trash",
                small: ""
              })
            ], 8, np)) : C("", !0)
          ])
        ]))), 128))
      ]),
      u.value ? (s(), ae(We, {
        key: 1,
        title: `Delete “${u.value.name}”?`,
        "data-rg-theme": t.theme,
        onClose: $[6] || ($[6] = (W) => u.value = null)
      }, {
        footer: ue(() => [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: $[4] || ($[4] = (W) => u.value = null)
          }, "Keep it"),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--danger",
            onClick: $[5] || ($[5] = (W) => E(u.value))
          }, "Delete")
        ]),
        default: ue(() => [
          $[20] || ($[20] = e("p", { style: { margin: "0" } }, "People it is shared with will lose it too. This cannot be undone from here.", -1))
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : C("", !0),
      O(Mt, {
        toasts: F(i),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, $m));
  }
}, ap = ["data-rg-theme"], op = {
  key: 0,
  class: "rg-main"
}, rp = { class: "rg-empty" }, ip = { class: "rg-empty__icon" }, up = { class: "rg-topbar" }, dp = { class: "rg-topbar__title" }, cp = { key: 0 }, gp = {
  key: 1,
  class: "rg-skeleton",
  style: { width: "220px", height: "18px" }
}, mp = {
  key: 2,
  class: "rg-topbar__meta"
}, pp = { class: "rg-topbar__actions" }, vp = ["disabled"], fp = {
  class: "rg-viewer__filter",
  for: "rg-viewer-period"
}, bp = ["value"], hp = {
  key: 0,
  class: "rg-viewer__range"
}, yp = {
  key: 0,
  class: "rg-viewer__filter"
}, $p = {
  key: 1,
  class: "rg-viewer__filter"
}, _p = {
  key: 2,
  class: "rg-viewer__filter"
}, kp = ["for"], wp = {
  key: 0,
  class: "rg-viewer__required"
}, xp = ["id", "onUpdate:modelValue"], Cp = ["value"], Sp = ["id", "onUpdate:modelValue", "type"], Mp = ["disabled"], Tp = {
  class: "rg-results",
  "aria-label": "Results"
}, Ep = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, Ap = { key: 0 }, Op = {
  key: 1,
  class: "rg-num"
}, Rp = {
  key: 0,
  class: "rg-errorbox",
  role: "alert"
}, Dp = { class: "rg-errorbox__title" }, Lp = {
  key: "label",
  class: "rg-filterchips__label"
}, Np = ["aria-label", "onClick"], il = 200, Uv = {
  __name: "ReportViewer",
  props: {
    reportId: { type: String, required: !0 },
    theme: { type: String, default: "light" },
    /** Offer "Dashboard" (for people who can build dashboards). */
    dashboards: { type: Boolean, default: !1 }
  },
  emits: ["edit", "loaded", "dashboard", "open-dashboard"],
  setup(t, { emit: o }) {
    const l = t, r = o, i = B(!1), g = [
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
    ], { api: h } = Pe();
    De("rg-theme", l.theme);
    const a = B(null), v = B(null), A = be({ period: "", from: "", to: "", lines: [], divisions: [], employees: [], parameters: {} }), c = be({ lines: !1, divisions: !1, employees: !1 }), d = be({
      draft: { rows: [], values: [], sort: [] },
      /** The viewer's own filters on report columns: [{ field, op, value, label, type }]. */
      filters: [],
      runSeq: 0,
      running: !1,
      error: null,
      meta: null
    }), u = q(() => {
      var le;
      return !!((le = a.value) != null && le.grouped) && d.draft.rows.length >= 2;
    }), b = q(() => !!a.value);
    let T = null;
    function D() {
      return A.period === "custom" ? A.from && A.to ? [A.from, A.to] : null : A.period || null;
    }
    function _() {
      const le = {}, L = D();
      L && (le.period = L);
      for (const Q of ["lines", "divisions", "employees"])
        A[Q].length && (le[Q] = A[Q]);
      return Object.keys(le).length ? le : void 0;
    }
    const f = () => ({
      parameters: A.parameters,
      context: _(),
      sort: d.draft.sort,
      ...d.filters.length ? { filters: d.filters.map(({ field: le, op: L, value: Q }) => ({ field: le, op: L, value: Q })) } : {}
    });
    function p(le) {
      return (L) => h.contextOptions(le, { search: L, lines: le === "lines" ? [] : A.lines, period: D() ?? void 0 });
    }
    async function y({ keys: le = [], offset: L = 0, top: Q = !1, size: I = il, fresh: R = !1 } = {}) {
      var S, ee;
      const k = u.value ? { columns: d.draft.rows.map((ne) => ne.as), keys: le } : void 0, m = Q && (L === 0 || R);
      m && ((S = T == null ? void 0 : T.abort) == null || S.call(T), T = typeof AbortController < "u" ? new AbortController() : null, d.running = !0, d.error = null);
      try {
        const ne = await h.reports.run(l.reportId, {
          ...f(),
          offset: L,
          size: I ?? il,
          groups: k,
          signal: T == null ? void 0 : T.signal
        });
        if (Q) {
          m && (d.meta = { ...ne.meta, rows: ne.rows.length, has_more: !!((ee = ne.page) != null && ee.has_more) });
          const me = Object.fromEntries((ne.columns ?? []).map((Ce) => [Ce.alias, Ce.label]));
          d.draft.rows.forEach((Ce) => {
            Ce.label = me[Ce.as] ?? Ce.label;
          });
        }
        return ne;
      } catch (ne) {
        throw Q && (d.error = ne), ne;
      } finally {
        m && (d.running = !1);
      }
    }
    function E() {
      d.runSeq++;
    }
    function x(le) {
      const L = d.draft.sort.find((Q) => Q.field === le);
      d.draft.sort = L ? L.dir === "asc" ? [{ field: le, dir: "desc" }] : [] : [{ field: le, dir: "asc" }], E();
    }
    function M(le) {
      d.draft.sort = le, E();
    }
    function $(le, L) {
      d.filters = d.filters.filter((Q) => Q.field !== le.alias), L && d.filters.push({ field: le.alias, label: le.label, type: le.type, kind: le.kind, ...L }), E();
    }
    function W(le) {
      const L = Array.isArray(le.value) ? le.op === "between" ? le.value.join(" – ") : le.value.join(", ") : le.value;
      return `${Ft[le.op] ?? le.op}${L == null ? "" : ` ${L}`}`;
    }
    De(Ee, {
      state: d,
      grouped: u,
      runnable: b,
      fetchRows: y,
      toggleSort: x,
      setSort: M,
      filterColumn: $,
      columnFilter: (le) => d.filters.find((L) => L.field === le) ?? null,
      // Combined reports are filtered by their own reports' filters.
      filterable: q(() => {
        var le;
        return ((le = a.value) == null ? void 0 : le.type) !== "combined";
      }),
      fetchSummary: () => h.reports.summary(l.reportId, f()),
      exportReport: (le) => h.reports.export(l.reportId, le, f()),
      gridKey: q(() => `view:${l.reportId}`)
    });
    async function re() {
      var le, L, Q;
      v.value = null, a.value = null;
      try {
        const I = await h.reports.view(l.reportId), R = Object.fromEntries((I.fields ?? []).map((S) => [S.as, S])), k = I.grouped && ((le = I.rows) != null && le.length) ? I.rows : (I.fields ?? []).filter((S) => S.kind === "dimension").map((S) => S.as);
        d.draft.rows = k.map((S) => {
          var ee, ne;
          return { as: S, label: ((ee = R[S]) == null ? void 0 : ee.label) ?? S, kind: "dimension", grain: ((ne = R[S]) == null ? void 0 : ne.grain) ?? null };
        }), d.draft.values = (I.fields ?? []).filter((S) => !k.includes(S.as)).map((S) => ({ as: S.as, label: S.label ?? S.as, kind: S.kind, grain: S.grain ?? null })), d.draft.sort = I.sort ?? [];
        const m = ((L = I.context) == null ? void 0 : L.period) ?? null;
        Array.isArray(m) ? Object.assign(A, { period: "custom", from: String(m[0]).slice(0, 10), to: String(m[1]).slice(0, 10) }) : A.period = typeof m == "string" && !m.startsWith("{{") ? m : "", A.parameters = Object.fromEntries((I.parameters ?? []).map((S) => [S.key, S.default ?? ""]));
        for (const S of ["lines", "divisions", "employees"])
          A[S] = Array.isArray((Q = I.context) == null ? void 0 : Q[S]) ? [...I.context[S]] : [];
        a.value = I, r("loaded", I), E();
        for (const S of ["lines", "divisions", "employees"])
          h.contextOptions(S, { lines: [] }).then((ee) => c[S] = ee.length > 0).catch(() => c[S] = !1);
      } catch (I) {
        v.value = I;
      }
    }
    ye(() => l.reportId, re), Me(re), Fe(() => {
      var le;
      return (le = T == null ? void 0 : T.abort) == null ? void 0 : le.call(T);
    });
    const ke = {
      MISSING_PARAMETER: "Choose a value to run this report",
      DATASET_FORBIDDEN: "No access",
      TIMEOUT: "The report took too long",
      TOO_HEAVY: "The report would read too much data",
      TOO_MANY_QUERIES: "Too many reports running",
      SERVER_BUSY: "The report server is busy"
    };
    return (le, L) => {
      var Q, I;
      return s(), n("div", {
        class: "rg-root rg-viewer",
        "data-rg-theme": t.theme
      }, [
        v.value ? (s(), n("div", op, [
          e("div", rp, [
            e("div", ip, [
              O(P, {
                name: v.value.status === 403 ? "lock" : "alert"
              }, null, 8, ["name"])
            ]),
            e("h2", null, w(v.value.status === 403 ? "You cannot open this report" : v.value.status === 404 ? "This report no longer exists" : "The report could not be opened"), 1),
            e("p", null, w(v.value.message), 1),
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: re
            }, "Try again")
          ])
        ])) : (s(), n(j, { key: 1 }, [
          e("header", up, [
            e("div", dp, [
              a.value ? (s(), n("h1", cp, w(a.value.name), 1)) : (s(), n("div", gp)),
              (Q = a.value) != null && Q.description ? (s(), n("div", mp, [
                e("span", null, w(a.value.description), 1)
              ])) : C("", !0)
            ]),
            e("div", pp, [
              (I = a.value) != null && I.can_edit ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn",
                onClick: L[0] || (L[0] = (R) => r("edit", a.value.uuid))
              }, [
                O(P, {
                  name: "fx",
                  small: ""
                }),
                L[13] || (L[13] = N(" Edit", -1))
              ])) : C("", !0),
              a.value && t.dashboards ? (s(), n("button", {
                key: 1,
                type: "button",
                class: "rg-btn",
                title: "Add a chart or number from this report to a dashboard",
                onClick: L[1] || (L[1] = (R) => i.value = !0)
              }, [
                O(P, {
                  name: "plus",
                  small: ""
                }),
                L[14] || (L[14] = N(" Pin to dashboard", -1))
              ])) : C("", !0),
              a.value && t.dashboards ? (s(), n("button", {
                key: 2,
                type: "button",
                class: "rg-btn",
                title: "Make a dashboard from this report",
                onClick: L[2] || (L[2] = (R) => r("dashboard", a.value.uuid))
              }, [
                O(P, {
                  name: "view",
                  small: ""
                }),
                L[15] || (L[15] = N(" Dashboard", -1))
              ])) : C("", !0),
              O(It, {
                run: (R) => F(h).reports.export(l.reportId, R, f()),
                disabled: !a.value
              }, null, 8, ["run", "disabled"]),
              e("button", {
                type: "button",
                class: "rg-btn rg-btn--primary",
                disabled: !a.value || d.running,
                onClick: E
              }, [
                O(P, {
                  name: "play",
                  small: ""
                }),
                L[16] || (L[16] = N(" Refresh", -1))
              ], 8, vp)
            ])
          ]),
          a.value ? (s(), n("form", {
            key: 0,
            class: "rg-viewer__filters",
            onSubmit: ge(E, ["prevent"])
          }, [
            e("label", fp, [
              e("span", null, [
                O(P, {
                  name: "calendar",
                  small: ""
                }),
                L[17] || (L[17] = N(" Period", -1))
              ]),
              se(e("select", {
                id: "rg-viewer-period",
                "onUpdate:modelValue": L[3] || (L[3] = (R) => A.period = R),
                class: "rg-input",
                onChange: L[4] || (L[4] = (R) => A.period !== "custom" && E())
              }, [
                L[18] || (L[18] = e("option", { value: "" }, "All dates", -1)),
                (s(), n(j, null, G(g, ([R, k]) => e("option", {
                  key: R,
                  value: R
                }, w(k), 9, bp)), 64)),
                L[19] || (L[19] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 544), [
                [Re, A.period]
              ])
            ]),
            O(tt, { name: "rg-swap" }, {
              default: ue(() => [
                A.period === "custom" ? (s(), n("div", hp, [
                  se(e("input", {
                    "onUpdate:modelValue": L[5] || (L[5] = (R) => A.from = R),
                    class: "rg-input",
                    type: "date",
                    "aria-label": "From",
                    required: ""
                  }, null, 512), [
                    [ce, A.from]
                  ]),
                  L[20] || (L[20] = e("span", { class: "rg-faint" }, "to", -1)),
                  se(e("input", {
                    "onUpdate:modelValue": L[6] || (L[6] = (R) => A.to = R),
                    class: "rg-input",
                    type: "date",
                    "aria-label": "To",
                    required: ""
                  }, null, 512), [
                    [ce, A.to]
                  ])
                ])) : C("", !0)
              ]),
              _: 1
            }),
            c.lines ? (s(), n("div", yp, [
              e("span", null, [
                O(P, {
                  name: "folder",
                  small: ""
                }),
                L[21] || (L[21] = N(" Lines", -1))
              ]),
              O(et, {
                modelValue: A.lines,
                "onUpdate:modelValue": L[7] || (L[7] = (R) => A.lines = R),
                label: "Lines",
                "all-label": "All my lines",
                load: p("lines"),
                onChange: E
              }, null, 8, ["modelValue", "load"])
            ])) : C("", !0),
            c.divisions ? (s(), n("div", $p, [
              e("span", null, [
                O(P, {
                  name: "users",
                  small: ""
                }),
                L[22] || (L[22] = N(" Divisions", -1))
              ]),
              O(et, {
                modelValue: A.divisions,
                "onUpdate:modelValue": L[8] || (L[8] = (R) => A.divisions = R),
                label: "Divisions",
                "all-label": "All my divisions",
                load: p("divisions"),
                "depends-on": A.lines,
                onChange: E
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : C("", !0),
            c.employees ? (s(), n("div", _p, [
              e("span", null, [
                O(P, {
                  name: "users",
                  small: ""
                }),
                L[23] || (L[23] = N(" Employees", -1))
              ]),
              O(et, {
                modelValue: A.employees,
                "onUpdate:modelValue": L[9] || (L[9] = (R) => A.employees = R),
                label: "Employees",
                "all-label": "All my employees",
                load: p("employees"),
                "depends-on": A.lines,
                onChange: E
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : C("", !0),
            (s(!0), n(j, null, G(a.value.parameters, (R) => (s(), n("label", {
              key: R.key,
              class: "rg-viewer__filter",
              for: `rg-viewer-p-${R.key}`
            }, [
              e("span", null, [
                N(w(R.label ?? R.key), 1),
                R.required ? (s(), n("b", wp, "*")) : C("", !0)
              ]),
              R.type === "date_range" ? se((s(), n("select", {
                key: 0,
                id: `rg-viewer-p-${R.key}`,
                "onUpdate:modelValue": (k) => A.parameters[R.key] = k,
                class: "rg-input"
              }, [
                (s(), n(j, null, G(g, ([k, m]) => e("option", {
                  key: k,
                  value: k
                }, w(m), 9, Cp)), 64))
              ], 8, xp)), [
                [Re, A.parameters[R.key]]
              ]) : se((s(), n("input", {
                key: 1,
                id: `rg-viewer-p-${R.key}`,
                "onUpdate:modelValue": (k) => A.parameters[R.key] = k,
                class: "rg-input",
                type: R.type === "number" ? "number" : "text"
              }, null, 8, Sp)), [
                [wt, A.parameters[R.key]]
              ])
            ], 8, kp))), 128)),
            e("button", {
              type: "submit",
              class: "rg-btn",
              disabled: d.running
            }, "Apply", 8, Mp)
          ], 32)) : C("", !0),
          e("section", Tp, [
            e("div", Ep, [
              d.running ? (s(), n("span", Ap, [
                O(P, {
                  name: "loader",
                  spin: "",
                  small: ""
                }),
                L[24] || (L[24] = N(" Running…", -1))
              ])) : d.meta ? (s(), n("span", Op, [
                N(w(d.meta.has_more ? `${F(Xe)(d.meta.rows ?? 0)}+ rows` : `${F(Xe)(d.meta.rows ?? 0)} rows`) + " ", 1),
                d.meta.duration_ms != null ? (s(), n(j, { key: 0 }, [
                  N(" · " + w(d.meta.duration_ms) + " ms", 1)
                ], 64)) : C("", !0)
              ])) : C("", !0)
            ]),
            d.error ? (s(), n("div", Rp, [
              e("span", Dp, [
                O(P, {
                  name: "alert",
                  small: ""
                }),
                N(w(ke[d.error.code] ?? "The report could not run"), 1)
              ]),
              e("span", null, w(d.error.message), 1)
            ])) : C("", !0),
            d.filters.length ? (s(), ae(je, {
              key: 1,
              tag: "div",
              name: "rg-list-fade",
              class: "rg-filterchips",
              "aria-label": "Column filters"
            }, {
              default: ue(() => [
                e("span", Lp, [
                  O(P, {
                    name: "filter",
                    small: ""
                  }),
                  L[25] || (L[25] = N(" Filtered", -1))
                ]),
                (s(!0), n(j, null, G(d.filters, (R) => (s(), n("span", {
                  key: R.field,
                  class: "rg-filterchip"
                }, [
                  e("b", null, w(R.label), 1),
                  N(" " + w(W(R)) + " ", 1),
                  e("button", {
                    type: "button",
                    "aria-label": `Remove the filter on ${R.label}`,
                    onClick: (k) => $({ alias: R.field }, null)
                  }, [
                    O(P, {
                      name: "x",
                      small: ""
                    })
                  ], 8, Np)
                ]))), 128)),
                e("button", {
                  key: "clear",
                  type: "button",
                  class: "rg-linkish",
                  onClick: L[10] || (L[10] = (R) => {
                    d.filters = [], E();
                  })
                }, "Clear all")
              ]),
              _: 1
            })) : C("", !0),
            a.value ? (s(), ae(qt, { key: 2 })) : C("", !0)
          ])
        ], 64)),
        i.value && a.value ? (s(), ae(Gt, {
          key: 2,
          report: a.value.uuid,
          "report-name": a.value.name,
          onClose: L[11] || (L[11] = (R) => i.value = !1),
          onOpenDashboard: L[12] || (L[12] = (R) => {
            i.value = !1, r("open-dashboard", R);
          })
        }, null, 8, ["report", "report-name"])) : C("", !0)
      ], 8, ap);
    };
  }
}, Tl = [
  ["this_month", "This month"],
  ["last_month", "Last month"],
  ["this_quarter", "This quarter"],
  ["last_quarter", "Last quarter"],
  ["this_year", "This year"],
  ["last_year", "Last year"],
  ["last_30_days", "Last 30 days"]
];
function El(t = 3) {
  let o = 0;
  const l = [];
  function r() {
    if (o >= t || l.length === 0) return;
    const { task: i, resolve: g, reject: h } = l.shift();
    o++, Promise.resolve().then(i).then(g, h).finally(() => {
      o--, r();
    });
  }
  return function(g) {
    return new Promise((h, a) => {
      l.push({ task: g, resolve: h, reject: a }), r();
    });
  };
}
const Vp = ["data-rg-theme"], Fp = {
  key: 0,
  class: "rg-main"
}, Pp = { class: "rg-empty" }, Up = { class: "rg-empty__icon" }, Ip = { class: "rg-topbar" }, qp = { class: "rg-topbar__title" }, jp = { key: 0 }, zp = {
  key: 1,
  class: "rg-skeleton",
  style: { width: "220px", height: "18px" }
}, Bp = {
  key: 2,
  class: "rg-topbar__meta"
}, Gp = { class: "rg-topbar__actions" }, Kp = ["disabled"], Hp = {
  class: "rg-viewer__filter",
  for: "rg-dash-period"
}, Wp = ["value"], Yp = {
  key: 0,
  class: "rg-viewer__range"
}, Jp = {
  key: 1,
  class: "rg-viewer__filter"
}, Qp = {
  key: 2,
  class: "rg-viewer__filter"
}, Zp = {
  key: 3,
  class: "rg-viewer__filter"
}, Xp = { class: "rg-dashboard__body" }, ev = {
  key: 0,
  class: "rg-dashboard__grid"
}, tv = { class: "rg-widget__skeleton" }, lv = {
  key: 1,
  class: "rg-dashboard__grid"
}, sv = {
  key: 0,
  class: "rg-faint"
}, Iv = {
  __name: "DashboardView",
  props: {
    dashboardId: { type: String, required: !0 },
    theme: { type: String, default: "light" }
  },
  emits: ["edit", "loaded"],
  setup(t, { emit: o }) {
    const l = t, r = o, { api: i } = Pe();
    De("rg-theme", l.theme), De("rg-widget-queue", El(3));
    const g = B(null), h = B(null), a = B(0), v = be({ period: "", from: "", to: "", lines: [], divisions: [], employees: [] }), A = be({ lines: !1, divisions: !1, employees: !1 });
    function c() {
      const D = {}, _ = v.period === "custom" ? v.from && v.to ? [v.from, v.to] : null : v.period || null;
      _ && (D.period = _);
      for (const f of ["lines", "divisions", "employees"]) v[f].length && (D[f] = v[f]);
      return D;
    }
    function d(D) {
      return () => i.dashboards.widget(l.dashboardId, D.id, { context: c() });
    }
    function u() {
      a.value++;
    }
    function b(D) {
      return (_) => i.contextOptions(D, { search: _, lines: D === "lines" ? [] : v.lines });
    }
    async function T() {
      var D;
      h.value = null;
      try {
        const _ = await i.dashboards.get(l.dashboardId), f = ((D = _.layout) == null ? void 0 : D.context) ?? {}, p = f.period ?? "";
        Object.assign(v, Array.isArray(p) ? { period: "custom", from: String(p[0]).slice(0, 10), to: String(p[1]).slice(0, 10) } : { period: typeof p == "string" ? p : "", from: "", to: "" });
        for (const y of ["lines", "divisions", "employees"]) v[y] = Array.isArray(f[y]) ? [...f[y]] : [];
        g.value = _, r("loaded", _);
        for (const y of ["lines", "divisions", "employees"])
          i.contextOptions(y, { lines: [] }).then((E) => A[y] = E.length > 0).catch(() => A[y] = !1);
      } catch (_) {
        h.value = _;
      }
    }
    return ye(() => l.dashboardId, T), Me(T), (D, _) => {
      var f, p;
      return s(), n("div", {
        class: "rg-root rg-dashboard",
        "data-rg-theme": t.theme
      }, [
        h.value ? (s(), n("div", Fp, [
          e("div", Pp, [
            e("div", Up, [
              O(P, {
                name: h.value.status === 403 ? "lock" : "alert"
              }, null, 8, ["name"])
            ]),
            e("h2", null, w(h.value.status === 403 ? "You cannot open this dashboard" : "The dashboard could not be opened"), 1),
            e("p", null, w(h.value.message), 1),
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: T
            }, "Try again")
          ])
        ])) : (s(), n(j, { key: 1 }, [
          e("header", Ip, [
            e("div", qp, [
              g.value ? (s(), n("h1", jp, w(g.value.name), 1)) : (s(), n("div", zp)),
              (f = g.value) != null && f.description ? (s(), n("div", Bp, [
                e("span", null, w(g.value.description), 1)
              ])) : C("", !0)
            ]),
            e("div", Gp, [
              (p = g.value) != null && p.can_edit ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn",
                onClick: _[0] || (_[0] = (y) => r("edit", g.value.uuid))
              }, [
                O(P, {
                  name: "fx",
                  small: ""
                }),
                _[8] || (_[8] = N(" Edit", -1))
              ])) : C("", !0),
              e("button", {
                type: "button",
                class: "rg-btn rg-btn--primary",
                disabled: !g.value,
                onClick: u
              }, [
                O(P, {
                  name: "play",
                  small: ""
                }),
                _[9] || (_[9] = N(" Refresh", -1))
              ], 8, Kp)
            ])
          ]),
          g.value ? (s(), n("form", {
            key: 0,
            class: "rg-viewer__filters",
            onSubmit: ge(u, ["prevent"])
          }, [
            e("label", Hp, [
              e("span", null, [
                O(P, {
                  name: "calendar",
                  small: ""
                }),
                _[10] || (_[10] = N(" Period", -1))
              ]),
              se(e("select", {
                id: "rg-dash-period",
                "onUpdate:modelValue": _[1] || (_[1] = (y) => v.period = y),
                class: "rg-input",
                onChange: _[2] || (_[2] = (y) => v.period !== "custom" && u())
              }, [
                _[11] || (_[11] = e("option", { value: "" }, "As saved in each report", -1)),
                (s(!0), n(j, null, G(F(Tl), ([y, E]) => (s(), n("option", {
                  key: y,
                  value: y
                }, w(E), 9, Wp))), 128)),
                _[12] || (_[12] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 544), [
                [Re, v.period]
              ])
            ]),
            v.period === "custom" ? (s(), n("div", Yp, [
              se(e("input", {
                "onUpdate:modelValue": _[3] || (_[3] = (y) => v.from = y),
                class: "rg-input",
                type: "date",
                "aria-label": "From",
                required: ""
              }, null, 512), [
                [ce, v.from]
              ]),
              _[13] || (_[13] = e("span", { class: "rg-faint" }, "to", -1)),
              se(e("input", {
                "onUpdate:modelValue": _[4] || (_[4] = (y) => v.to = y),
                class: "rg-input",
                type: "date",
                "aria-label": "To",
                required: ""
              }, null, 512), [
                [ce, v.to]
              ])
            ])) : C("", !0),
            A.lines ? (s(), n("div", Jp, [
              e("span", null, [
                O(P, {
                  name: "folder",
                  small: ""
                }),
                _[14] || (_[14] = N(" Lines", -1))
              ]),
              O(et, {
                modelValue: v.lines,
                "onUpdate:modelValue": _[5] || (_[5] = (y) => v.lines = y),
                label: "Lines",
                "all-label": "All my lines",
                load: b("lines"),
                onChange: u
              }, null, 8, ["modelValue", "load"])
            ])) : C("", !0),
            A.divisions ? (s(), n("div", Qp, [
              e("span", null, [
                O(P, {
                  name: "users",
                  small: ""
                }),
                _[15] || (_[15] = N(" Divisions", -1))
              ]),
              O(et, {
                modelValue: v.divisions,
                "onUpdate:modelValue": _[6] || (_[6] = (y) => v.divisions = y),
                label: "Divisions",
                "all-label": "All my divisions",
                load: b("divisions"),
                "depends-on": v.lines,
                onChange: u
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : C("", !0),
            A.employees ? (s(), n("div", Zp, [
              e("span", null, [
                O(P, {
                  name: "users",
                  small: ""
                }),
                _[16] || (_[16] = N(" Employees", -1))
              ]),
              O(et, {
                modelValue: v.employees,
                "onUpdate:modelValue": _[7] || (_[7] = (y) => v.employees = y),
                label: "Employees",
                "all-label": "All my employees",
                load: b("employees"),
                "depends-on": v.lines,
                onChange: u
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : C("", !0),
            _[17] || (_[17] = e("button", {
              type: "submit",
              class: "rg-btn"
            }, "Apply", -1))
          ], 32)) : C("", !0),
          e("main", Xp, [
            g.value ? (s(), n("div", lv, [
              (s(!0), n(j, null, G(g.value.layout.widgets, (y, E) => (s(), ae(Ct, {
                key: y.id,
                widget: y,
                load: d(y),
                version: a.value,
                style: Se({ "--rg-delay": `${E * 50}ms` })
              }, null, 8, ["widget", "load", "version", "style"]))), 128)),
              g.value.layout.widgets.length ? C("", !0) : (s(), n("p", sv, "This dashboard has no widgets yet."))
            ])) : (s(), n("div", ev, [
              (s(), n(j, null, G(4, (y) => e("div", {
                key: y,
                class: "rg-widget rg-widget--md"
              }, [
                e("div", tv, [
                  (s(), n(j, null, G(4, (E) => e("span", {
                    key: E,
                    class: "rg-skeleton"
                  })), 64))
                ])
              ])), 64))
            ]))
          ])
        ], 64))
      ], 8, Vp);
    };
  }
}, nv = ["data-rg-theme"], av = { class: "rg-topbar" }, ov = { class: "rg-topbar__title" }, rv = { class: "rg-topbar__meta" }, iv = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, uv = { class: "rg-topbar__actions" }, dv = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Who can open it"
}, cv = ["aria-pressed"], gv = ["aria-pressed"], mv = ["disabled"], pv = { class: "rg-viewer__filters" }, vv = {
  class: "rg-viewer__filter",
  for: "rg-dash-edit-period"
}, fv = ["value"], bv = { class: "rg-dashboard__body" }, hv = {
  key: 0,
  class: "rg-dashboard__grid"
}, yv = { class: "rg-widget__skeleton" }, $v = {
  key: 1,
  class: "rg-empty"
}, _v = { class: "rg-empty__icon" }, kv = { class: "rg-widget__tools" }, wv = ["for"], xv = ["id", "value", "onChange"], Cv = ["value", "disabled"], Sv = ["aria-label", "onClick"], Mv = ["aria-label", "title", "onClick"], Tv = ["aria-label", "disabled", "onClick"], Ev = ["aria-label", "disabled", "onClick"], Av = ["aria-label", "onClick"], Ov = {
  key: 0,
  class: "rg-widget-dialog__preview"
}, Rv = {
  key: 0,
  class: "rg-faint rg-dialog__why"
}, Dv = ["disabled"], qv = {
  __name: "DashboardEditor",
  props: {
    /** Saved dashboard to edit, or null for a new one. */
    dashboardId: { type: String, default: null },
    /** Report uuid to start a new dashboard from. */
    fromReport: { type: String, default: null },
    theme: { type: String, default: "light" }
  },
  emits: ["saved", "published", "view"],
  setup(t, { emit: o }) {
    const l = t, r = o, { api: i } = Pe(), g = St();
    De("rg-theme", l.theme), De("rg-widget-queue", El(3));
    const h = [["sm", "Small"], ["md", "Half"], ["lg", "Two thirds"], ["full", "Full width"]], a = be({ loading: !0, saving: !1, uuid: null, name: "Untitled dashboard", visibility: "private", canPublish: !1, published: !1, period: "", widgets: [] }), v = B(0), A = B(null), c = B([]), d = be({}), u = B(null), b = B(!1);
    let T = 0;
    const D = () => `w${Date.now().toString(36)}${(++T).toString(36)}`, _ = () => a.period ? { period: a.period } : {}, f = (I) => () => i.dashboards.preview(I, { context: _() });
    async function p(I) {
      var R;
      if (!I) return { dims: [], nums: [] };
      if (!d[I]) {
        d[I] = { dims: [], nums: [], loading: !0 };
        try {
          const k = await i.reports.view(I);
          d[I] = xl(k.fields ?? []);
        } catch {
          d[I] = { dims: [], nums: [], failed: !0 };
        }
      }
      return ((R = A.value) == null ? void 0 : R.report) === I && zt(A.value, d[I]), d[I];
    }
    Me(async () => {
      var I, R, k;
      try {
        if (i.reports.list().then((m) => {
          c.value = m.data ?? [], A.value && !A.value.report && c.value[0] && (A.value.report = c.value[0].uuid, p(c.value[0].uuid));
        }).catch(() => {
        }), l.dashboardId) {
          const m = await i.dashboards.get(l.dashboardId);
          Object.assign(a, {
            uuid: m.uuid,
            name: m.name,
            visibility: m.visibility,
            canPublish: m.can_publish,
            published: m.published,
            period: typeof ((R = (I = m.layout) == null ? void 0 : I.context) == null ? void 0 : R.period) == "string" ? m.layout.context.period : "",
            widgets: m.layout.widgets ?? []
          });
        } else if (l.fromReport) {
          const m = await i.dashboards.generate(l.fromReport);
          Object.assign(a, { name: m.name, period: typeof ((k = m.context) == null ? void 0 : k.period) == "string" ? m.context.period : "", widgets: m.widgets });
        }
      } catch (m) {
        g.error(m);
      } finally {
        a.loading = !1;
      }
    });
    function y(I = null) {
      var k, m;
      const R = (I == null ? void 0 : I.report) ?? ((k = a.widgets[0]) == null ? void 0 : k.report) ?? l.fromReport ?? ((m = c.value[0]) == null ? void 0 : m.uuid) ?? "";
      A.value = I ? { ...I, values: [...I.values ?? []] } : { id: null, type: "kpi", title: "", report: R, category: null, values: [], top: 10, size: "sm" }, p(A.value.report);
    }
    const E = q(() => {
      var I, R;
      return d[(I = A.value) == null ? void 0 : I.report] ?? { dims: [], nums: [], loading: !!((R = A.value) != null && R.report) };
    }), x = q(() => ju(A.value)), M = q(() => !x.value);
    function $(I, R) {
      a.widgets = a.widgets.map((k) => k.id === I.id ? wl(k, R) : k);
    }
    function W() {
      var k, m, S;
      const I = { ...A.value };
      if (!((k = I.title) == null ? void 0 : k.trim())) {
        const ee = E.value.nums;
        I.title = I.values.map((ne) => {
          var me;
          return ((me = ee.find((Ce) => Ce.as === ne)) == null ? void 0 : me.label) ?? ne;
        }).join(", ") || ((m = c.value.find((ne) => ne.uuid === I.report)) == null ? void 0 : m.name) || "Widget";
      }
      I.report_name = ((S = c.value.find((ee) => ee.uuid === I.report)) == null ? void 0 : S.name) ?? I.report_name, I.id ? a.widgets = a.widgets.map((ee) => ee.id === I.id ? I : ee) : a.widgets = [...a.widgets, { ...I, id: D() }], A.value = null;
    }
    function re(I) {
      a.widgets = a.widgets.filter((R) => R.id !== I);
    }
    function ke(I, R) {
      const k = [...a.widgets], m = k.findIndex((ee) => ee.id === I), S = m + R;
      m === -1 || S < 0 || S >= k.length || (k.splice(S, 0, k.splice(m, 1)[0]), a.widgets = k);
    }
    function le(I) {
      const R = h.map(([m]) => m), k = R[(R.indexOf(I.size ?? "md") + 1) % R.length];
      a.widgets = a.widgets.map((m) => m.id === I.id ? { ...m, size: k } : m);
    }
    function L(I) {
      if (!u.value || u.value === I) return;
      const R = [...a.widgets], k = R.findIndex((S) => S.id === u.value), m = R.findIndex((S) => S.id === I);
      R.splice(m, 0, R.splice(k, 1)[0]), a.widgets = R, u.value = null;
    }
    async function Q() {
      a.saving = !0;
      const I = {
        name: a.name.trim() || "Untitled dashboard",
        visibility: a.visibility,
        layout: { context: _(), widgets: a.widgets.map(({ report_name: R, ...k }) => k) }
      };
      try {
        const R = a.uuid ? await i.dashboards.update(a.uuid, I) : await i.dashboards.create(I);
        Object.assign(a, { uuid: R.uuid, canPublish: R.can_publish, published: R.published }), g.success(`Saved "${R.name}".`), r("saved", R);
      } catch (R) {
        g.error(R);
      } finally {
        a.saving = !1;
      }
    }
    return (I, R) => (s(), n("div", {
      class: "rg-root rg-dashboard rg-dashboard--editing",
      "data-rg-theme": t.theme
    }, [
      e("header", av, [
        e("div", ov, [
          R[18] || (R[18] = e("label", {
            class: "rg-sr-only",
            for: "rg-dash-name"
          }, "Dashboard name", -1)),
          se(e("input", {
            id: "rg-dash-name",
            "onUpdate:modelValue": R[0] || (R[0] = (k) => a.name = k),
            class: "rg-input rg-input--bare rg-name-input",
            maxlength: "255"
          }, null, 512), [
            [ce, a.name]
          ]),
          e("div", rv, [
            e("span", null, w(a.widgets.length) + " " + w(a.widgets.length === 1 ? "widget" : "widgets"), 1),
            a.published ? (s(), n("span", iv, [
              O(P, {
                name: "globe",
                small: ""
              }),
              R[17] || (R[17] = N(" Published", -1))
            ])) : C("", !0)
          ])
        ]),
        e("div", uv, [
          e("div", dv, [
            e("button", {
              type: "button",
              "aria-pressed": a.visibility === "private",
              onClick: R[1] || (R[1] = (k) => a.visibility = "private")
            }, "Only me", 8, cv),
            e("button", {
              type: "button",
              "aria-pressed": a.visibility === "public",
              onClick: R[2] || (R[2] = (k) => a.visibility = "public")
            }, "Everyone", 8, gv)
          ]),
          a.uuid && a.canPublish ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn",
            onClick: R[3] || (R[3] = (k) => b.value = !0)
          }, [
            O(P, {
              name: "globe",
              small: ""
            }),
            N(" " + w(a.published ? "Publishing" : "Publish"), 1)
          ])) : C("", !0),
          a.uuid ? (s(), n("button", {
            key: 1,
            type: "button",
            class: "rg-btn",
            onClick: R[4] || (R[4] = (k) => r("view", a.uuid))
          }, [
            O(P, {
              name: "eye",
              small: ""
            }),
            R[19] || (R[19] = N(" View", -1))
          ])) : C("", !0),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            disabled: a.saving || !a.widgets.length,
            onClick: Q
          }, [
            O(P, {
              name: "save",
              small: ""
            }),
            N(" " + w(a.saving ? "Saving…" : "Save"), 1)
          ], 8, mv)
        ])
      ]),
      e("div", pv, [
        e("label", vv, [
          e("span", null, [
            O(P, {
              name: "calendar",
              small: ""
            }),
            R[20] || (R[20] = N(" Default period", -1))
          ]),
          se(e("select", {
            id: "rg-dash-edit-period",
            "onUpdate:modelValue": R[5] || (R[5] = (k) => a.period = k),
            class: "rg-input",
            onChange: R[6] || (R[6] = (k) => v.value++)
          }, [
            R[21] || (R[21] = e("option", { value: "" }, "As saved in each report", -1)),
            (s(!0), n(j, null, G(F(Tl), ([k, m]) => (s(), n("option", {
              key: k,
              value: k
            }, w(m), 9, fv))), 128))
          ], 544), [
            [Re, a.period]
          ])
        ]),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          onClick: R[7] || (R[7] = (k) => y())
        }, [
          O(P, {
            name: "plus",
            small: ""
          }),
          R[22] || (R[22] = N(" Add widget", -1))
        ])
      ]),
      e("main", bv, [
        a.loading ? (s(), n("div", hv, [
          (s(), n(j, null, G(4, (k) => e("div", {
            key: k,
            class: "rg-widget rg-widget--md"
          }, [
            e("div", yv, [
              (s(), n(j, null, G(4, (m) => e("span", {
                key: m,
                class: "rg-skeleton"
              })), 64))
            ])
          ])), 64))
        ])) : a.widgets.length ? (s(), ae(je, {
          key: 2,
          tag: "div",
          name: "rg-list-move",
          class: "rg-dashboard__grid"
        }, {
          default: ue(() => [
            (s(!0), n(j, null, G(a.widgets, (k, m) => (s(), ae(Ct, {
              key: k.id,
              widget: k,
              load: f(k),
              version: v.value,
              class: oe({ "is-dragging": u.value === k.id }),
              draggable: "true",
              onDragstart: (S) => u.value = k.id,
              onDragend: R[9] || (R[9] = (S) => u.value = null),
              onDragover: R[10] || (R[10] = ge(() => {
              }, ["prevent"])),
              onDrop: ge((S) => L(k.id), ["prevent"])
            }, {
              actions: ue(() => {
                var S;
                return [
                  e("div", kv, [
                    e("label", {
                      class: "rg-sr-only",
                      for: `rg-type-${k.id}`
                    }, "Show " + w(k.title) + " as", 9, wv),
                    e("select", {
                      id: `rg-type-${k.id}`,
                      class: "rg-input rg-widget__type",
                      value: k.type,
                      title: "Show as",
                      onChange: (ee) => $(k, ee.target.value)
                    }, [
                      (s(!0), n(j, null, G(F(_l), (ee) => (s(), n("option", {
                        key: ee.value,
                        value: ee.value,
                        disabled: !ee.fits(k)
                      }, w(ee.label), 9, Cv))), 128))
                    ], 40, xv),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Edit ${k.title}`,
                      onClick: (ee) => y(k)
                    }, [
                      O(P, {
                        name: "fx",
                        small: ""
                      })
                    ], 8, Sv),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Resize ${k.title}`,
                      title: `Size: ${(S = h.find(([ee]) => ee === (k.size ?? "md"))) == null ? void 0 : S[1]}`,
                      onClick: (ee) => le(k)
                    }, w({ sm: "S", md: "M", lg: "L", full: "Full" }[k.size ?? "md"]), 9, Mv),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${k.title} earlier`,
                      disabled: m === 0,
                      onClick: (ee) => ke(k.id, -1)
                    }, "‹", 8, Tv),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${k.title} later`,
                      disabled: m === a.widgets.length - 1,
                      onClick: (ee) => ke(k.id, 1)
                    }, "›", 8, Ev),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Remove ${k.title}`,
                      onClick: (ee) => re(k.id)
                    }, [
                      O(P, {
                        name: "trash",
                        small: ""
                      })
                    ], 8, Av)
                  ])
                ];
              }),
              _: 2
            }, 1032, ["widget", "load", "version", "class", "onDragstart", "onDrop"]))), 128))
          ]),
          _: 1
        })) : (s(), n("div", $v, [
          e("div", _v, [
            O(P, { name: "view" })
          ]),
          R[24] || (R[24] = e("h2", null, "Add your first widget", -1)),
          R[25] || (R[25] = e("p", null, "Show a report's totals as headline numbers, its top items as bars, how it changes over time, or its first rows.", -1)),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: R[8] || (R[8] = (k) => y())
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            R[23] || (R[23] = N(" Add widget", -1))
          ])
        ]))
      ]),
      A.value ? (s(), ae(We, {
        key: 0,
        title: A.value.id ? "Edit widget" : "Add widget",
        class: "rg-widget-dialog",
        "data-rg-theme": t.theme,
        onClose: R[13] || (R[13] = (k) => A.value = null)
      }, {
        footer: ue(() => [
          x.value ? (s(), n("span", Rv, w(x.value), 1)) : C("", !0),
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: R[12] || (R[12] = (k) => A.value = null)
          }, "Cancel"),
          e("button", {
            type: "submit",
            form: "rg-widget-form",
            class: "rg-btn rg-btn--primary",
            disabled: !M.value
          }, w(A.value.id ? "Update" : "Add"), 9, Dv)
        ]),
        default: ue(() => [
          e("form", {
            id: "rg-widget-form",
            class: "rg-publish",
            onSubmit: R[11] || (R[11] = ge((k) => M.value && W(), ["prevent"]))
          }, [
            O(Ml, {
              widget: A.value,
              reports: c.value,
              columns: E.value,
              onReport: p
            }, null, 8, ["widget", "reports", "columns"]),
            M.value ? (s(), n("div", Ov, [
              R[26] || (R[26] = e("span", { class: "rg-faint" }, "Preview", -1)),
              O(Ct, {
                widget: { ...A.value, size: "full" },
                load: f(A.value),
                version: v.value
              }, null, 8, ["widget", "load", "version"])
            ])) : C("", !0)
          ], 32)
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : C("", !0),
      b.value ? (s(), ae(jt, {
        key: 1,
        kind: "dashboard",
        uuid: a.uuid,
        name: a.name,
        onClose: R[14] || (R[14] = (k) => b.value = !1),
        onPublished: R[15] || (R[15] = (k) => {
          a.published = !0, r("published", k);
        }),
        onUnpublished: R[16] || (R[16] = (k) => {
          a.published = !1, r("published", k);
        })
      }, null, 8, ["uuid", "name"])) : C("", !0),
      O(Mt, {
        toasts: F(g),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, nv));
  }
};
export {
  Zg as CombinedBuilder,
  qv as DashboardEditor,
  Iv as DashboardView,
  Gt as PinToDashboard,
  jt as PublishDialog,
  gl as REPORT_GENERATOR_KEY,
  Fv as ReportBuilder,
  el as ReportGeneratorApiError,
  Pv as ReportLibrary,
  Uv as ReportViewer,
  Vv as TopicsBrowser,
  Dl as createApiClient,
  Nv as createReportGenerator,
  Pe as useReportGenerator
};
//# sourceMappingURL=report-generator.js.map
