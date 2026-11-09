import { inject as ye, openBlock as s, createElementBlock as n, normalizeClass as ne, createElementVNode as e, provide as Re, reactive as $e, ref as K, computed as G, watch as he, onMounted as Se, createVNode as E, createTextVNode as N, toDisplayString as y, withDirectives as se, vModelText as ce, Fragment as U, renderList as H, createCommentVNode as x, normalizeStyle as Me, TransitionGroup as lt, withCtx as de, createBlock as ae, Transition as it, vModelCheckbox as ot, unref as R, Teleport as Zt, mergeProps as Qt, onBeforeUnmount as Ne, withModifiers as ge, renderSlot as rt, withKeys as Ie, resolveComponent as hs, vModelSelect as Pe, nextTick as qt, vModelRadio as It, vShow as Ut, vModelDynamic as ys } from "vue";
class jt extends Error {
  constructor(u, { status: l = null, errors: g = {}, code: d = null, path: b = null, details: f = null, cause: o = null } = {}) {
    super(u), this.name = "ReportGeneratorApiError", this.status = l, this.errors = g, this.code = d, this.path = b, this.details = f, this.cause = o;
  }
}
function $s(t) {
  var g;
  const u = (g = t == null ? void 0 : t.response) == null ? void 0 : g.data;
  return (u == null ? void 0 : u.errors) && Object.values(u.errors).flat()[0] || (u == null ? void 0 : u.message) || (t == null ? void 0 : t.message) || "Request failed";
}
function _s({ http: t, basePath: u = "/api/report-generator" } = {}) {
  if (!t || typeof t.get != "function" || typeof t.post != "function")
    throw new TypeError("report-generator: pass an axios-compatible `http` instance (get/post/patch/delete).");
  const l = u.replace(/\/+$/, ""), g = (i) => `${l}/${i.replace(/^\/+/, "")}`;
  async function d(i, r, a, c) {
    var k, C, h, p, v, w, O, _, S;
    try {
      return (i === "get" || i === "delete" ? await t[i](g(r), c) : await t[i](g(r), a, c)).data;
    } catch ($) {
      throw new jt($s($), {
        status: ((k = $ == null ? void 0 : $.response) == null ? void 0 : k.status) ?? null,
        errors: ((h = (C = $ == null ? void 0 : $.response) == null ? void 0 : C.data) == null ? void 0 : h.errors) ?? {},
        code: ((v = (p = $ == null ? void 0 : $.response) == null ? void 0 : p.data) == null ? void 0 : v.code) ?? null,
        path: ((O = (w = $ == null ? void 0 : $.response) == null ? void 0 : w.data) == null ? void 0 : O.path) ?? null,
        details: ((S = (_ = $ == null ? void 0 : $.response) == null ? void 0 : _.data) == null ? void 0 : S.details) ?? null,
        cause: $
      });
    }
  }
  async function b(i, r, a = "report") {
    var p, v, w, O;
    let c;
    try {
      c = await t.post(g(i), r, { responseType: "blob" });
    } catch (_) {
      let S = (p = _ == null ? void 0 : _.response) == null ? void 0 : p.data;
      if (S && typeof S.text == "function")
        try {
          S = JSON.parse(await S.text());
        } catch {
          S = null;
        }
      throw new jt((S == null ? void 0 : S.message) || (_ == null ? void 0 : _.message) || "Export failed", {
        status: ((v = _ == null ? void 0 : _.response) == null ? void 0 : v.status) ?? null,
        code: (S == null ? void 0 : S.code) ?? null,
        errors: (S == null ? void 0 : S.errors) ?? {},
        cause: _
      });
    }
    const k = ((w = c.headers) == null ? void 0 : w["content-disposition"]) ?? "", C = /filename\*=UTF-8''([^;]+)/i.exec(k) ?? /filename="?([^";]+)"?/i.exec(k), h = C ? decodeURIComponent(C[1]) : a;
    if (typeof window < "u" && ((O = window.URL) != null && O.createObjectURL)) {
      const _ = window.URL.createObjectURL(c.data), S = document.createElement("a");
      S.href = _, S.download = h, document.body.appendChild(S), S.click(), S.remove(), setTimeout(() => window.URL.revokeObjectURL(_), 1e3);
    }
    return h;
  }
  return {
    basePath: l,
    combine: {
      reports: () => d("get", "combine/reports").then((i) => i.data),
      fields: (i, { level: r, period: a, lines: c = [] } = {}) => d("get", `combine/reports/${encodeURIComponent(i)}/fields`, void 0, {
        params: { level: r, ...a ? { period: a } : {}, ...c.length ? { lines: c } : {} }
      }).then((k) => k.data)
    },
    dashboards: {
      list: () => d("get", "dashboards").then((i) => i.data),
      get: (i) => d("get", `dashboards/${i}`).then((r) => r.data),
      create: (i) => d("post", "dashboards", i).then((r) => r.data),
      update: (i, r) => d("patch", `dashboards/${i}`, r).then((a) => a.data),
      remove: (i) => d("delete", `dashboards/${i}`),
      /** A first layout for a report: { name, context, widgets }. */
      generate: (i) => d("post", "dashboards-generate", { report: i }).then((r) => r.data),
      /** One saved widget's data with the viewer's report filters. */
      widget: (i, r, { context: a } = {}) => d("post", `dashboards/${i}/widgets/${encodeURIComponent(r)}`, a ? { context: a } : {}),
      /** A widget being edited. */
      preview: (i, { context: r } = {}) => d("post", "dashboards-preview", { widget: i, ...r ? { context: r } : {} }),
      publishing: (i) => d("get", `dashboards/${i}/publish`).then((r) => r.data),
      publish: (i, { permission: r, roles: a = [], inMenu: c = !1, menuGroup: k = null }) => d("put", `dashboards/${i}/publish`, {
        permission: r,
        roles: a,
        in_menu: c,
        menu_group: k
      }).then((C) => C.data),
      unpublish: (i) => d("delete", `dashboards/${i}/publish`).then((r) => r.data),
      /** Adds a widget to a dashboard you own; returns the dashboard. */
      pin: (i, r) => d("post", `dashboards/${i}/pin`, { widget: r }).then((a) => a.data)
    },
    query: {
      /** Without a root: topics to start from, by tab. With a root: its relation tree and a flat list for the builder. */
      catalog: (i) => d("get", "catalog", void 0, i ? { params: { root: i } } : void 0),
      validate: (i, r = {}) => d("post", "query/validate", { definition: i, parameters: r }),
      /**
       * One page of results. groups = { columns: [aliases], keys: [opened group values] }
       * for AG Grid's server-side row model; queryId lets cancel() stop it.
       */
      rows: (i, { parameters: r = {}, offset: a = 0, size: c, groups: k, queryId: C, signal: h } = {}) => d(
        "post",
        "query/rows",
        { definition: i, parameters: r, page: { offset: a, ...c ? { size: c } : {} }, ...k ? { groups: k } : {}, ...C ? { query_id: C } : {} },
        h ? { signal: h } : void 0
      ),
      values: (i, r = "", a = 50) => d("post", "query/values", { field: i, search: r, limit: a }).then((c) => c.data),
      /** Row count and grand totals of the whole report: { rows, totals, duration_ms, cached }. */
      summary: (i, r = {}) => d("post", "query/summary", { definition: i, parameters: r }),
      /** Streams the whole report as a file (format: csv | xlsx) and saves it. */
      export: (i, r, { parameters: a = {}, name: c } = {}) => b("query/export", { definition: i, parameters: a, format: r, name: c }, c),
      cancel: (i) => d("post", `query/${encodeURIComponent(i)}/cancel`)
    },
    reports: {
      list: (i = {}) => d("get", "reports", void 0, { params: i }),
      get: (i) => d("get", `reports/${i}`).then((r) => r.data),
      create: (i) => d("post", "reports", i).then((r) => r.data),
      update: (i, r) => d("patch", `reports/${i}`, r).then((a) => a.data),
      duplicate: (i) => d("post", `reports/${i}/duplicate`).then((r) => r.data),
      remove: (i) => d("delete", `reports/${i}`),
      share: (i, r, a) => d("put", `reports/${i}/shares`, { shares: r, ...a ? { visibility: a } : {} }).then((c) => c.data),
      /** Publishing: settings (with a suggested permission), publish, unpublish. Needs the publish ability. */
      publishing: (i) => d("get", `reports/${i}/publish`).then((r) => r.data),
      publish: (i, { permission: r, roles: a = [], inMenu: c = !1, menuGroup: k = null }) => d("put", `reports/${i}/publish`, {
        permission: r,
        roles: a,
        in_menu: c,
        menu_group: k
      }).then((C) => C.data),
      unpublish: (i) => d("delete", `reports/${i}/publish`).then((r) => r.data),
      /** Opening a saved report as it was saved (anyone who may open it). */
      view: (i) => d("get", `reports/${i}/view`).then((r) => r.data),
      run: (i, { parameters: r = {}, context: a, sort: c, offset: k = 0, size: C, groups: h, queryId: p, signal: v } = {}) => d(
        "post",
        `reports/${i}/rows`,
        {
          parameters: r,
          ...a ? { context: a } : {},
          ...c ? { sort: c } : {},
          page: { offset: k, ...C ? { size: C } : {} },
          ...h ? { groups: h } : {},
          ...p ? { query_id: p } : {}
        },
        v ? { signal: v } : void 0
      ),
      values: (i, r, a = "", c = 50) => d("post", `reports/${i}/values`, { field: r, search: a, limit: c }).then((k) => k.data),
      summary: (i, { parameters: r = {}, context: a, sort: c } = {}) => d("post", `reports/${i}/summary`, {
        parameters: r,
        ...a ? { context: a } : {},
        ...c ? { sort: c } : {}
      }),
      export: (i, r, { parameters: a = {}, context: c, sort: k } = {}) => b(`reports/${i}/export`, {
        format: r,
        parameters: a,
        ...c ? { context: c } : {},
        ...k ? { sort: k } : {}
      })
    },
    /** Version, the current user's abilities, registered sources and limits. */
    meta: () => d("get", "meta"),
    /** Published reports in the menu the current user may open: [{ uuid, name, description, group }]. */
    menu: () => d("get", "menu").then((i) => i.data),
    /** Choices for a report filter (kind: lines | divisions | employees): [{ id, label }]. */
    contextOptions: (i, { search: r = "", lines: a = [], period: c } = {}) => d("get", `context/${i}`, void 0, {
      params: { ...r ? { search: r } : {}, ...a.length ? { lines: a } : {}, ...c ? { period: c } : {} }
    }).then((k) => k.data),
    /** Roles a report can be published to: [{ id, name }]. */
    roles: () => d("get", "permissions/roles").then((i) => i.data),
    /** Every topic by tab, with filter columns, fields and relations (admins). */
    topics: () => d("get", "topics"),
    request: d
  };
}
const Xt = Symbol("report-generator");
function fp(t = {}) {
  const u = _s(t);
  return {
    api: u,
    install(l) {
      l.provide(Xt, { api: u });
    }
  };
}
function Le() {
  const t = ye(Xt, null);
  if (!t)
    throw new Error("report-generator: call app.use(createReportGenerator({ http })) before using its components.");
  return t;
}
const ks = [
  { value: "dimension", label: "Dimension", short: "Dim", hint: "Group and filter by it" },
  { value: "measure", label: "Measure", short: "Msr", hint: "Add it up, average it, count it" },
  { value: "time", label: "Date", short: "Date", hint: "Group by day, month, quarter, year" },
  { value: "key", label: "Key", short: "Key", hint: "Used for joins and counting" }
], St = {
  string: "text",
  text: "paragraph",
  integer: "hash",
  decimal: "hash",
  boolean: "toggle",
  date: "calendar",
  datetime: "calendar",
  time: "clock",
  json: "braces"
}, pt = {
  sum: "Sum",
  avg: "Average",
  min: "Min",
  max: "Max",
  count: "Count",
  count_distinct: "Distinct"
}, ws = ["d"], F = {
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
      globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"
    };
    return (l, g) => (s(), n("svg", {
      class: ne(["rg-icon", { "rg-icon--sm": t.small, "rg-spin": t.spin }]),
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      focusable: "false"
    }, [
      e("path", {
        d: u[t.name] || u.alert
      }, null, 8, ws)
    ], 2));
  }
}, xs = ["data-rg-theme"], Cs = { class: "rg-topbar" }, Ss = { class: "rg-topbar__title" }, Ms = { class: "rg-topbar__meta" }, Ts = { class: "rg-search rg-topics__search" }, Es = {
  key: 0,
  class: "rg-topics__tabs",
  role: "tablist",
  "aria-label": "Topic groups"
}, Os = ["aria-selected", "onClick"], Rs = { class: "rg-num" }, Ds = {
  key: 1,
  class: "rg-body"
}, As = { class: "rg-sidebar" }, Ls = { class: "rg-skeleton-list" }, Ns = {
  key: 2,
  class: "rg-main"
}, Vs = { class: "rg-empty" }, Ps = { class: "rg-empty__icon" }, Fs = {
  key: 3,
  class: "rg-main"
}, qs = { class: "rg-empty" }, Is = { class: "rg-empty__icon" }, Us = {
  key: 4,
  class: "rg-body"
}, js = { class: "rg-sidebar" }, zs = ["aria-current", "onClick"], Bs = { class: "rg-list__label" }, Gs = { class: "rg-list__flags" }, Ks = { class: "rg-list__sub" }, Hs = { class: "rg-mono" }, Ws = { key: 0 }, Ys = {
  key: 0,
  class: "rg-list__empty"
}, Js = { class: "rg-main" }, Zs = { class: "rg-panel__head" }, Qs = { class: "rg-panel__title" }, Xs = { class: "rg-topic__title" }, el = { class: "rg-facts" }, tl = { class: "rg-mono" }, sl = { class: "rg-mono" }, ll = { class: "rg-faint rg-mono" }, nl = {
  key: 0,
  class: "rg-muted rg-topic__desc"
}, al = {
  key: 1,
  class: "rg-topic__conditions"
}, ol = {
  key: 0,
  class: "rg-faint"
}, rl = { class: "rg-mono" }, il = { class: "rg-topic__badges" }, ul = {
  key: 0,
  class: "rg-badge rg-badge--warning"
}, dl = {
  key: 1,
  class: "rg-badge rg-badge--info"
}, cl = {
  key: 2,
  class: "rg-badge",
  title: "Readable through relations from topics a user may read; never a report's main topic"
}, gl = { class: "rg-card" }, ml = { class: "rg-topic__filters" }, pl = {
  key: 0,
  class: "rg-mono rg-faint"
}, vl = { class: "rg-card" }, fl = { class: "rg-card__head" }, bl = { class: "rg-num rg-faint" }, hl = {
  key: 0,
  class: "rg-field-inline"
}, yl = { class: "rg-table-wrap" }, $l = { class: "rg-table rg-topic__fields" }, _l = { class: "rg-cell-field" }, kl = { class: "rg-cell-field__sub" }, wl = { class: "rg-mono" }, xl = { key: 0 }, Cl = { class: "rg-type" }, Sl = ["title"], Ml = { class: "rg-muted" }, Tl = { class: "rg-card" }, El = { class: "rg-card__head" }, Ol = { class: "rg-num rg-faint" }, Rl = {
  key: 0,
  class: "rg-muted rg-topic__none"
}, Dl = {
  key: 1,
  class: "rg-topic__relations"
}, Al = ["onClick"], Ll = ["data-kind"], Nl = { class: "rg-topic__relation-text" }, Vl = { class: "rg-faint" }, Pl = { class: "rg-mono" }, bp = {
  __name: "TopicsBrowser",
  props: {
    theme: { type: String, default: "light" },
    /** Topic key to open first. */
    initialTopic: { type: String, default: null }
  },
  emits: ["select"],
  setup(t, { emit: u }) {
    const l = t, g = u, { api: d } = Le();
    Re("rg-theme", l.theme);
    const b = $e({ loading: !0, error: null, groups: [], group: null, topic: null }), f = K(""), o = K(!1), m = [
      { key: "period", label: "Period", icon: "calendar" },
      { key: "line", label: "Line", icon: "folder" },
      { key: "division", label: "Division", icon: "users" },
      { key: "employee", label: "Employee", icon: "users" }
    ], M = Object.fromEntries(ks.map((_) => [_.value, _.label])), i = G(() => b.groups.flatMap((_) => _.topics)), r = G(() => Object.fromEntries(i.value.map((_) => [_.key, _]))), a = G(() => r.value[b.topic] ?? null), c = G(() => {
      var S;
      const _ = f.value.trim().toLowerCase();
      return _ ? i.value.filter(($) => $.label.toLowerCase().includes(_) || $.key.includes(_) || $.fields.some((X) => X.label.toLowerCase().includes(_))) : ((S = b.groups.find(($) => $.name === b.group)) == null ? void 0 : S.topics) ?? [];
    }), k = G(() => {
      var _;
      return (((_ = a.value) == null ? void 0 : _.fields) ?? []).filter((S) => o.value || !S.hidden);
    }), C = G(() => {
      var _;
      return (((_ = a.value) == null ? void 0 : _.fields) ?? []).filter((S) => S.hidden).length;
    });
    async function h() {
      var _, S;
      b.loading = !0, b.error = null;
      try {
        const $ = await d.topics();
        b.groups = $.groups ?? [], p(l.initialTopic && r.value[l.initialTopic] ? l.initialTopic : (S = (_ = b.groups[0]) == null ? void 0 : _.topics[0]) == null ? void 0 : S.key);
      } catch ($) {
        b.error = $.message;
      } finally {
        b.loading = !1;
      }
    }
    function p(_) {
      const S = r.value[_];
      S && (b.topic = _, b.group = S.group ?? b.group);
    }
    function v(_) {
      var $, X;
      b.group = _, f.value = "";
      const S = ($ = b.groups.find((W) => W.name === _)) == null ? void 0 : $.topics[0];
      S && ((X = a.value) == null ? void 0 : X.group) !== _ && (b.topic = S.key);
    }
    he(() => b.topic, (_) => _ && g("select", _));
    function w(_) {
      return Object.entries(_.conditions ?? {}).map(([S, $]) => ({
        column: S,
        text: $ === null ? "is empty" : Array.isArray($) ? `in ${$.join(", ")}` : `= ${$}`
      }));
    }
    function O(_, S) {
      var $;
      return (($ = _.columns) == null ? void 0 : $[S]) ?? null;
    }
    return Se(h), (_, S) => (s(), n("div", {
      class: "rg-root rg-topics",
      "data-rg-theme": t.theme
    }, [
      e("header", Cs, [
        e("div", Ss, [
          S[3] || (S[3] = e("h1", null, "Topics", -1)),
          e("div", Ms, [
            e("span", null, [
              E(F, {
                name: "folder",
                small: ""
              }),
              N(y(b.groups.length) + " tabs", 1)
            ]),
            e("span", null, [
              E(F, {
                name: "table",
                small: ""
              }),
              N(y(i.value.length) + " topics", 1)
            ]),
            S[2] || (S[2] = e("span", null, [
              N("Defined in code: "),
              e("span", { class: "rg-mono" }, "app/Reporting/Topics")
            ], -1))
          ])
        ]),
        e("label", Ts, [
          S[4] || (S[4] = e("span", { class: "rg-sr-only" }, "Search topics and fields", -1)),
          E(F, { name: "search" }),
          se(e("input", {
            "onUpdate:modelValue": S[0] || (S[0] = ($) => f.value = $),
            class: "rg-input",
            type: "search",
            placeholder: "Search topics and fields",
            autocomplete: "off"
          }, null, 512), [
            [ce, f.value]
          ])
        ])
      ]),
      b.groups.length ? (s(), n("nav", Es, [
        (s(!0), n(U, null, H(b.groups, ($) => (s(), n("button", {
          key: $.name,
          type: "button",
          role: "tab",
          class: "rg-topics__tab",
          "aria-selected": !f.value && b.group === $.name,
          onClick: (X) => v($.name)
        }, [
          N(y($.name), 1),
          e("span", Rs, y($.topics.length), 1)
        ], 8, Os))), 128))
      ])) : x("", !0),
      b.loading ? (s(), n("div", Ds, [
        e("aside", As, [
          e("div", Ls, [
            (s(), n(U, null, H(6, ($) => e("div", {
              key: $,
              class: "rg-skeleton",
              style: Me({ width: `${50 + $ * 37 % 45}%` })
            }, null, 4)), 64))
          ])
        ]),
        S[5] || (S[5] = e("main", { class: "rg-main" }, null, -1))
      ])) : b.error ? (s(), n("div", Ns, [
        e("div", Vs, [
          e("div", Ps, [
            E(F, { name: "alert" })
          ]),
          S[6] || (S[6] = e("h2", null, "Topics could not be loaded", -1)),
          e("p", null, y(b.error), 1),
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: h
          }, "Try again")
        ])
      ])) : i.value.length ? (s(), n("div", Us, [
        e("aside", js, [
          E(lt, {
            tag: "ul",
            name: "rg-list-fade",
            class: "rg-list",
            "aria-label": f.value ? "Matching topics" : b.group
          }, {
            default: de(() => [
              (s(!0), n(U, null, H(c.value, ($) => (s(), n("li", {
                key: $.key
              }, [
                e("button", {
                  type: "button",
                  class: "rg-list__item",
                  "aria-current": $.key === b.topic,
                  onClick: (X) => p($.key)
                }, [
                  e("span", Bs, y($.label), 1),
                  e("span", Gs, [
                    $.permission ? (s(), ae(F, {
                      key: 0,
                      name: "lock",
                      small: "",
                      title: `Needs ${$.permission}`
                    }, null, 8, ["title"])) : x("", !0),
                    $.public ? (s(), ae(F, {
                      key: 1,
                      name: "globe",
                      small: "",
                      title: "Anyone may read it in full"
                    })) : x("", !0)
                  ]),
                  e("span", Ks, [
                    e("span", Hs, y($.table), 1),
                    e("span", null, "· " + y($.fields_count) + " fields", 1),
                    f.value ? (s(), n("span", Ws, "· " + y($.group), 1)) : x("", !0)
                  ])
                ], 8, zs)
              ]))), 128))
            ]),
            _: 1
          }, 8, ["aria-label"]),
          c.value.length ? x("", !0) : (s(), n("p", Ys, "Nothing matches “" + y(f.value) + "”.", 1))
        ]),
        e("main", Js, [
          E(it, {
            name: "rg-swap",
            mode: "out-in"
          }, {
            default: de(() => [
              a.value ? (s(), n("section", {
                key: a.value.key,
                class: "rg-panel rg-topic"
              }, [
                e("div", Zs, [
                  e("div", Qs, [
                    e("h2", Xs, y(a.value.label), 1),
                    e("div", el, [
                      e("span", null, [
                        E(F, {
                          name: "key",
                          small: ""
                        }),
                        e("span", tl, y(a.value.key), 1)
                      ]),
                      e("span", null, [
                        E(F, {
                          name: "table",
                          small: ""
                        }),
                        e("span", sl, y(a.value.table), 1)
                      ]),
                      e("span", ll, y(a.value.class), 1)
                    ]),
                    a.value.description ? (s(), n("p", nl, y(a.value.description), 1)) : x("", !0),
                    w(a.value).length ? (s(), n("p", al, [
                      E(F, {
                        name: "filter",
                        small: ""
                      }),
                      S[10] || (S[10] = N(" Only rows where ", -1)),
                      (s(!0), n(U, null, H(w(a.value), ($, X) => (s(), n(U, {
                        key: $.column
                      }, [
                        X ? (s(), n("span", ol, "and")) : x("", !0),
                        e("code", rl, y($.column) + " " + y($.text), 1)
                      ], 64))), 128))
                    ])) : x("", !0)
                  ]),
                  e("div", il, [
                    a.value.permission ? (s(), n("span", ul, [
                      E(F, {
                        name: "lock",
                        small: ""
                      }),
                      N(y(a.value.permission), 1)
                    ])) : x("", !0),
                    a.value.public ? (s(), n("span", dl, [
                      E(F, {
                        name: "globe",
                        small: ""
                      }),
                      S[11] || (S[11] = N("Public lookup", -1))
                    ])) : x("", !0),
                    a.value.lookup ? (s(), n("span", cl, [
                      E(F, {
                        name: "link",
                        small: ""
                      }),
                      S[12] || (S[12] = N("Joined only", -1))
                    ])) : x("", !0)
                  ])
                ]),
                e("div", gl, [
                  S[13] || (S[13] = e("div", { class: "rg-card__head" }, [
                    e("h2", null, "Report filters"),
                    e("span", { class: "rg-muted" }, "Every report on this topic can be limited by these")
                  ], -1)),
                  e("ul", ml, [
                    (s(), n(U, null, H(m, ($) => e("li", {
                      key: $.key,
                      class: ne({ "is-off": !a.value.filters[$.key] })
                    }, [
                      E(F, {
                        name: a.value.filters[$.key] ? "check" : "x",
                        small: ""
                      }, null, 8, ["name"]),
                      e("b", null, y($.label), 1),
                      O(a.value, $.key) ? (s(), n("span", pl, y(O(a.value, $.key)), 1)) : x("", !0)
                    ], 2)), 64))
                  ])
                ]),
                e("div", vl, [
                  e("div", fl, [
                    e("h2", null, [
                      S[14] || (S[14] = N("Fields ", -1)),
                      e("span", bl, y(k.value.length), 1)
                    ]),
                    C.value ? (s(), n("label", hl, [
                      se(e("input", {
                        "onUpdate:modelValue": S[1] || (S[1] = ($) => o.value = $),
                        type: "checkbox",
                        class: "rg-check"
                      }, null, 512), [
                        [ot, o.value]
                      ]),
                      N(" Show " + y(C.value) + " id " + y(C.value === 1 ? "column" : "columns"), 1)
                    ])) : x("", !0)
                  ]),
                  e("div", yl, [
                    e("table", $l, [
                      S[15] || (S[15] = e("thead", null, [
                        e("tr", null, [
                          e("th", null, "Field"),
                          e("th", null, "Type"),
                          e("th", null, "Use"),
                          e("th", null, "Totals")
                        ])
                      ], -1)),
                      E(lt, {
                        tag: "tbody",
                        name: "rg-list-fade"
                      }, {
                        default: de(() => [
                          (s(!0), n(U, null, H(k.value, ($) => (s(), n("tr", {
                            key: $.key,
                            class: ne(["rg-topic__field", { "rg-row--hidden": $.hidden }])
                          }, [
                            e("td", null, [
                              e("div", _l, [
                                e("b", null, y($.label), 1),
                                e("span", kl, [
                                  e("span", wl, y($.key), 1),
                                  $.description ? (s(), n("span", xl, "· " + y($.description), 1)) : x("", !0)
                                ])
                              ])
                            ]),
                            e("td", null, [
                              e("span", Cl, [
                                E(F, {
                                  name: R(St)[$.type] ?? "text",
                                  small: ""
                                }, null, 8, ["name"]),
                                N(y($.type), 1)
                              ])
                            ]),
                            e("td", null, [
                              e("span", {
                                class: ne(["rg-badge rg-role", `rg-role--${$.role}`])
                              }, y($.key === "__rows" ? "Count" : R(M)[$.role] ?? $.role), 3),
                              $.options ? (s(), n("span", {
                                key: 0,
                                class: "rg-faint rg-topic__options",
                                title: Object.values($.options).join(", ")
                              }, y(Object.keys($.options).length) + " values ", 9, Sl)) : x("", !0)
                            ]),
                            e("td", Ml, y(($.aggregations ?? []).map((X) => R(pt)[X] ?? X).join(", ") || "—"), 1)
                          ], 2))), 128))
                        ]),
                        _: 1
                      })
                    ])
                  ])
                ]),
                e("div", Tl, [
                  e("div", El, [
                    e("h2", null, [
                      S[16] || (S[16] = N("Relations ", -1)),
                      e("span", Ol, y(a.value.relations.length), 1)
                    ]),
                    S[17] || (S[17] = e("span", { class: "rg-muted" }, "Fields of these topics can be added to its reports", -1))
                  ]),
                  a.value.relations.length ? (s(), n("ul", Dl, [
                    (s(!0), n(U, null, H(a.value.relations, ($) => (s(), n("li", {
                      key: $.name
                    }, [
                      e("button", {
                        type: "button",
                        class: "rg-topic__relation",
                        onClick: (X) => p($.topic)
                      }, [
                        e("span", {
                          class: "rg-topic__relation-kind",
                          "data-kind": $.type
                        }, y($.type === "hasMany" ? "many" : "one"), 9, Ll),
                        e("span", Nl, [
                          e("b", null, y($.label), 1),
                          e("span", Vl, [
                            N(y($.topic_label) + " · ", 1),
                            e("span", Pl, y($.foreign_key), 1)
                          ])
                        ]),
                        E(F, {
                          name: "arrow",
                          small: ""
                        })
                      ], 8, Al)
                    ]))), 128))
                  ])) : (s(), n("p", Rl, "This topic does not link to other topics."))
                ])
              ])) : x("", !0)
            ]),
            _: 1
          })
        ])
      ])) : (s(), n("div", Fs, [
        e("div", qs, [
          e("div", Is, [
            E(F, { name: "database" })
          ]),
          S[7] || (S[7] = e("h2", null, "No topics yet", -1)),
          S[8] || (S[8] = e("p", null, "Topics are PHP classes in your app. Draft one from a model, then edit its labels:", -1)),
          S[9] || (S[9] = e("code", { class: "rg-mono" }, 'php artisan report-generator:make-topic ActualVisits --model="App\\ActualVisit"', -1))
        ])
      ]))
    ], 8, xs));
  }
};
let Fl = 1;
const Ue = () => `f${Fl++}`, Mt = "__rows", ql = {
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
}, Il = ["=", "!=", "in", "not_in", "contains", "not_contains", "starts_with", "ends_with", "is_null", "not_null"], Ul = ["=", "!=", ">", ">=", "<", "<=", "between", "in", "is_null", "not_null"], jl = ["between", "=", ">", ">=", "<", "<=", "is_null", "not_null"], zl = ["=", "is_null", "not_null"], Bl = [">", ">=", "<", "<=", "=", "!=", "between"];
function es(t, u = !1) {
  return u ? Bl : t === "integer" || t === "decimal" ? Ul : t === "date" || t === "datetime" ? jl : t === "boolean" ? zl : Il;
}
const zt = [
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
function xt() {
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
function Bt(t) {
  const u = String(t).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
  return /^[a-z_]/.test(u) ? u || "field" : `f_${u}`;
}
function Tt(t, u, l = null) {
  const g = new Set([...t.rows, ...t.values].filter((b) => b !== l).map((b) => b.as));
  let d = Bt(u);
  for (let b = 2; g.has(d); b++) d = `${Bt(u)}_${b}`;
  return d;
}
function ts(t, u, l) {
  return u.key === Mt || t.key === l || u.label.toLowerCase().includes(t.label.toLowerCase()) ? u.label : `${t.label} ${u.label}`;
}
function at(t) {
  return t.field === Mt ? t.baseLabel : `${pt[t.agg] ?? t.agg} of ${t.baseLabel}`;
}
function _t(t, u, l, { path: g = null, asValue: d = null } = {}) {
  var m;
  const b = ts(u, l, t.root), f = d ?? l.role === "measure", o = {
    uid: Ue(),
    kind: f ? "measure" : "dimension",
    dataset: u.key,
    datasetLabel: u.label,
    field: l.key,
    type: l.type,
    role: l.role,
    aggregations: (m = l.aggregations) != null && m.length ? l.aggregations : ["count", "count_distinct"],
    baseLabel: b,
    grain: null,
    agg: null,
    path: g,
    format: null
  };
  return f ? (o.agg = o.aggregations.includes("sum") ? "sum" : o.aggregations[0], o.label = at(o)) : (l.role === "time" && (o.grain = "month"), o.label = b), o.as = Tt(t, o.label), o;
}
function Gl(t, u, l) {
  return { uid: Ue(), kind: "formula", label: u, formula: l, as: Tt(t, u), format: null };
}
function Kl(t) {
  if (t.kind === "formula")
    return { formula: t.formula, as: t.as, label: t.label, ...t.format ? { format: t.format } : {} };
  const u = { ref: `${t.dataset}.${t.field}`, as: t.as, label: t.label };
  return t.kind === "measure" && (u.agg = t.agg), t.kind === "dimension" && t.grain && (u.grain = t.grain), t.path && (u.path = t.path), t.format && (u.format = t.format), u;
}
function ss(t) {
  if (t.items)
    return { [t.boolean]: t.items.map(ss).filter(Boolean) };
  const u = { field: t.target, op: t.op };
  return ["is_null", "not_null"].includes(t.op) || (u.value = t.value), t.path && (u.path = t.path), u;
}
function Hl(t) {
  if (t.items || ["is_null", "not_null"].includes(t.op)) return !0;
  const u = t.value;
  return u == null || u === "" ? !1 : Array.isArray(u) ? t.op === "between" ? u.length === 2 && u.every((l) => l !== "" && l !== null) : u.length > 0 : !0;
}
function ls(t) {
  return { boolean: t.boolean, items: t.items.filter(Hl).map((u) => u.items ? ls(u) : u) };
}
function ns(t) {
  const u = [...t.rows, ...t.values], l = {};
  u.forEach((b, f) => l[`fields.${f}`] = b.uid);
  const g = {
    version: 1,
    root: t.root,
    fields: u.map(Kl),
    sort: t.sort.filter((b) => u.some((f) => f.as === b.field)),
    subtotals: t.subtotals,
    ui: { grouped: t.grouped, rows: t.rows.map((b) => b.as) }
  };
  t.parameters.length && (g.parameters = t.parameters);
  const d = ls(t.filters);
  if (d.items.length) {
    g.filters = ss(d);
    const b = (f, o) => f.items.forEach((m, M) => {
      const i = `${o}.${f.boolean}.${M}`;
      m.items ? b(m, i) : l[i] = m.uid;
    });
    b(d, "filters");
  }
  return { definition: g, locations: l };
}
function Wl(t, u, l = {}) {
  var o, m, M;
  const g = xt();
  g.root = t.root, g.subtotals = !!t.subtotals, g.grouped = ((o = t.ui) == null ? void 0 : o.grouped) ?? !0, g.parameters = t.parameters ?? [], g.sort = t.sort ?? [], Object.assign(g, {
    uuid: l.uuid ?? null,
    name: l.name ?? g.name,
    description: l.description ?? "",
    folder: l.folder ?? "",
    visibility: l.visibility ?? "private",
    canEdit: l.can_edit ?? !0,
    canPublish: l.can_publish ?? !1,
    published: l.published ?? !1
  });
  const d = Object.fromEntries(u.map((i) => [i.key, i])), b = new Set(((m = t.ui) == null ? void 0 : m.rows) ?? []);
  for (const i of t.fields ?? []) {
    if (i.formula) {
      g.values.push({ uid: Ue(), kind: "formula", label: i.label ?? i.as, formula: i.formula, as: i.as, format: i.format ?? null });
      continue;
    }
    const [r, a] = i.ref.split("."), c = d[r] ?? { key: r, label: r, fields: [] }, k = c.fields.find((p) => p.key === a) ?? { key: a, label: a, type: "string", role: "dimension", aggregations: [] }, C = !!i.agg && !b.has(i.as), h = {
      uid: Ue(),
      kind: C ? "measure" : "dimension",
      dataset: r,
      datasetLabel: c.label,
      field: a,
      type: k.type,
      role: k.role,
      aggregations: (M = k.aggregations) != null && M.length ? k.aggregations : ["count", "count_distinct"],
      baseLabel: ts(c, k, t.root),
      grain: i.grain ?? null,
      agg: i.agg ?? null,
      path: i.path ?? null,
      format: i.format ?? null,
      as: i.as,
      label: i.label ?? i.as,
      missing: !d[r] || !c.fields.some((p) => p.key === a)
    };
    (C ? g.values : g.rows).push(h);
  }
  const f = (i) => {
    const r = i.and ? "and" : i.or ? "or" : null;
    return r ? { uid: Ue(), boolean: r, items: i[r].map(f) } : { uid: Ue(), target: i.field, op: i.op, value: i.value ?? null, path: i.path ?? null };
  };
  if (t.filters) {
    const i = f(t.filters);
    g.filters = i.items ? { boolean: i.boolean, items: i.items } : { boolean: "and", items: [i] };
  }
  return g;
}
function Yl(t) {
  return !!t.root && t.rows.length + t.values.length > 0;
}
const Jl = 60, Gt = 200;
function Zl() {
  var t, u;
  return ((u = (t = globalThis.crypto) == null ? void 0 : t.randomUUID) == null ? void 0 : u.call(t)) ?? `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function Ql(t, u) {
  const l = $e({
    draft: xt(),
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
  }), g = { past: [], future: [], applying: !1 }, d = G(() => ns(l.draft)), b = G(() => d.value.definition), f = G(() => Yl(l.draft)), o = G(() => {
    var j;
    return Object.fromEntries((((j = l.catalog) == null ? void 0 : j.datasets) ?? []).map((Y) => [Y.key, Y]));
  }), m = G(() => l.draft.grouped && l.draft.rows.length >= 2), M = () => JSON.stringify(l.draft), i = G(() => l.savedSnapshot !== null && M() !== l.savedSnapshot);
  let r = null, a = null;
  he(() => M(), (j) => {
    if (g.applying) {
      a = j;
      return;
    }
    clearTimeout(r), r = setTimeout(() => {
      a !== null && a !== j && (g.past.push(a), g.past.length > Jl && g.past.shift(), g.future = [], k()), a = j;
    }, 250);
  });
  function c(j) {
    g.applying = !0, Object.assign(l.draft, JSON.parse(j)), queueMicrotask(() => g.applying = !1);
  }
  function k() {
    l.undoDepth = g.past.length, l.redoDepth = g.future.length;
  }
  function C() {
    g.past.length && (clearTimeout(r), g.future.push(M()), c(g.past.pop()), k());
  }
  function h() {
    g.future.length && (clearTimeout(r), g.past.push(M()), c(g.future.pop()), k());
  }
  const p = () => l.undoDepth > 0, v = () => l.redoDepth > 0;
  async function w(j = null) {
    var Y;
    l.loading = !0;
    try {
      if (j) {
        const Q = await t.reports.get(j);
        await O(Q.definition.root), l.draft = Wl(Q.definition, ((Y = l.catalog) == null ? void 0 : Y.datasets) ?? [], Q), fe();
      } else
        l.draft = xt(), l.roots = (await t.query.catalog()).datasets;
      l.savedSnapshot = M(), a = l.savedSnapshot, g.past = [], g.future = [], k(), f.value && Qe();
    } catch (Q) {
      u.error(Q);
    } finally {
      l.loading = !1;
    }
  }
  async function O(j) {
    l.loadingCatalog = !0;
    try {
      l.catalog = await t.query.catalog(j);
    } finally {
      l.loadingCatalog = !1;
    }
  }
  async function _(j) {
    try {
      await O(j), Object.assign(l.draft, { root: j, rows: [], values: [], filters: { boolean: "and", items: [] }, sort: [] }), l.error = null, l.meta = null;
    } catch (Y) {
      u.error(Y);
    }
  }
  async function S() {
    if (!l.roots)
      try {
        l.roots = (await t.query.catalog()).datasets;
      } catch (j) {
        u.error(j);
        return;
      }
    l.draft.root = null, l.catalog = null;
  }
  function $(j) {
    for (const Y of ["rows", "values"]) {
      const Q = l.draft[Y].findIndex((J) => J.uid === j);
      if (Q !== -1) return { shelf: Y, index: Q, item: l.draft[Y][Q] };
    }
    return null;
  }
  function X(j, Y, Q = null, J = null, le = void 0, ue = null) {
    var Ge;
    const be = o.value[j], me = be == null ? void 0 : be.fields.find((yt) => yt.key === Y);
    if (!be || !me) return;
    if (le === void 0 && ((Ge = be.paths) == null ? void 0 : Ge.length) > 1) {
      l.pathChoice = { dataset: be, field: me, target: Q, index: J, parentUid: ue, options: be.paths };
      return;
    }
    const Fe = le ?? null, ve = Q ?? (me.role === "measure" ? "values" : "rows");
    if (ve === "filters") {
      A({ target: `${j}.${Y}`, type: me.type, label: _t(l.draft, be, me).baseLabel, path: Fe }, ue);
      return;
    }
    const Oe = _t(l.draft, be, me, { path: Fe, asValue: ve === "values" }), et = l.draft[ve];
    et.splice(J ?? et.length, 0, Oe);
  }
  function W(j) {
    const Y = l.pathChoice;
    l.pathChoice = null, Y && X(Y.dataset.key, Y.field.key, Y.target, Y.index, j, Y.parentUid);
  }
  function pe(j) {
    const Y = $(j);
    if (!Y) return;
    const Q = Y.item.as;
    l.draft[Y.shelf].splice(Y.index, 1), l.draft.sort = l.draft.sort.filter((J) => J.field !== Q), l.draft.filters.items = l.draft.filters.items.filter((J) => J.target !== Q);
  }
  function z(j, Y, Q) {
    const J = $(j);
    if (!J) return;
    const { item: le } = J;
    if (Y === "rows" && le.kind === "formula") return;
    l.draft[J.shelf].splice(J.index, 1), Y !== J.shelf && (Y === "values" ? (le.kind = "measure", le.grain = null, le.agg = le.aggregations.includes("sum") ? "sum" : le.aggregations.includes("count_distinct") ? "count_distinct" : le.aggregations[0], le.label = at(le)) : (le.kind = "dimension", le.agg = null, le.role === "time" && (le.grain = "month"), le.label = le.baseLabel), le.as = Tt(l.draft, le.label, le));
    const ue = l.draft[Y];
    ue.splice(Math.min(Q ?? ue.length, ue.length), 0, le);
  }
  function B(j, Y) {
    var ue;
    const Q = $(j);
    if (!Q) return;
    const { item: J } = Q, le = J.kind === "measure" ? J.label === at(J) : J.label === J.baseLabel;
    Object.assign(J, Y), "agg" in Y && le && (J.label = at(J)), "label" in Y && !((ue = Y.label) != null && ue.trim()) && (J.label = J.kind === "measure" ? at(J) : J.baseLabel);
  }
  function q(j, Y) {
    const Q = Gl(l.draft, j, Y);
    return l.draft.values.push(Q), Q;
  }
  function L(j, Y, Q) {
    const J = $(j);
    J && Object.assign(J.item, { label: Y, formula: Q });
  }
  function D(j) {
    if (!j) return l.draft.filters;
    const Y = (Q) => {
      for (const J of Q.items) {
        if (J.uid === j) return J;
        if (J.items) {
          const le = Y(J);
          if (le) return le;
        }
      }
      return null;
    };
    return Y(l.draft.filters) ?? l.draft.filters;
  }
  function A(j, Y = null) {
    const Q = es(j.type, j.isTotal)[0], J = {
      uid: Ue(),
      target: j.target,
      type: j.type,
      label: j.label,
      isTotal: !!j.isTotal,
      path: j.path ?? null,
      op: Q,
      value: Q === "between" && (j.type === "date" || j.type === "datetime") ? "this_month" : null
    };
    return D(Y).items.push(J), J;
  }
  function T(j) {
    const Y = $(j);
    if (!Y) return;
    const Q = Y.item.kind === "measure" && ["count", "count_distinct"].includes(Y.item.agg) ? "integer" : "decimal";
    A({ target: Y.item.as, type: Q, label: Y.item.label, isTotal: !0 });
  }
  function V() {
    l.draft.filters.items.push({ uid: Ue(), boolean: l.draft.filters.boolean === "and" ? "or" : "and", items: [] });
  }
  function re(j, Y) {
    if ("op" in Y && Y.op !== j.op) {
      const Q = ["in", "not_in", "between"].includes(j.op), J = ["in", "not_in", "between"].includes(Y.op);
      (Q !== J || Y.op === "between" || j.op === "between") && (Y.value = Y.op === "between" && (j.type === "date" || j.type === "datetime") ? "this_month" : J ? [] : null);
    }
    Object.assign(j, Y);
  }
  function ie(j) {
    const Y = (Q) => {
      Q.items = Q.items.filter((J) => J.uid !== j), Q.items.forEach((J) => J.items && Y(J));
    };
    Y(l.draft.filters);
  }
  function fe() {
    const j = (Y) => Y.items.forEach((Q) => {
      if (Q.items) return j(Q);
      if (Q.target.includes(".")) {
        const [J, le] = Q.target.split("."), ue = o.value[J], be = ue == null ? void 0 : ue.fields.find((me) => me.key === le);
        Q.type = (be == null ? void 0 : be.type) ?? "string", Q.label = be ? _t(l.draft, ue, be).baseLabel : Q.target, Q.isTotal = !1;
      } else {
        const J = [...l.draft.rows, ...l.draft.values].find((le) => le.as === Q.target);
        Q.label = (J == null ? void 0 : J.label) ?? Q.target, Q.isTotal = (J == null ? void 0 : J.kind) !== "dimension", Q.type = (J == null ? void 0 : J.kind) === "dimension" ? J.type : "decimal";
      }
    });
    j(l.draft.filters);
  }
  function Je(j) {
    const Y = l.draft.sort.find((Q) => Q.field === j);
    Y ? Y.dir === "asc" ? l.draft.sort = [{ field: j, dir: "desc" }] : l.draft.sort = [] : l.draft.sort = [{ field: j, dir: "asc" }];
  }
  let Te = null, xe = null;
  function Ze() {
    Te == null || Te.abort(), xe && t.query.cancel(xe).catch(() => {
    }), Te = null, xe = null;
  }
  function Qe() {
    if (!f.value) {
      l.meta = null, l.error = null;
      return;
    }
    l.runSeq++;
  }
  async function Xe({ keys: j = [], offset: Y = 0, top: Q = !1, size: J = Gt, fresh: le = !1 } = {}) {
    var me, Fe;
    const ue = m.value ? { columns: l.draft.rows.map((ve) => ve.as), keys: j } : void 0, be = Q && (Y === 0 || le);
    be && (Ze(), Te = typeof AbortController < "u" ? new AbortController() : null, xe = Zl(), l.running = !0, l.error = null, l.errorUid = null);
    try {
      const ve = await t.query.rows(b.value, {
        offset: Y,
        size: J ?? Gt,
        groups: ue,
        queryId: be ? xe : void 0,
        signal: Te == null ? void 0 : Te.signal
      });
      return Q && (l.meta = { ...ve.meta, columns: ve.columns }), ve;
    } catch (ve) {
      throw ((me = ve == null ? void 0 : ve.cause) == null ? void 0 : me.name) === "CanceledError" || ((Fe = ve == null ? void 0 : ve.cause) == null ? void 0 : Fe.name) === "AbortError" || (Q ? (l.error = ve, l.errorUid = ve.path ? ut(ve.path) : null) : u.error(ve)), ve;
    } finally {
      be && (l.running = !1, xe = null);
    }
  }
  function ut(j) {
    const { locations: Y } = d.value, Q = j.split(".");
    for (let J = Q.length; J > 0; J--) {
      const le = Y[Q.slice(0, J).join(".")];
      if (le) return le;
    }
    return null;
  }
  function ht(j, Y) {
    const Q = $(j);
    if (Q) {
      Q.item.path = Y;
      return;
    }
    const J = (le) => le.items.forEach((ue) => ue.items ? J(ue) : ue.uid === j && (ue.path = Y));
    J(l.draft.filters);
  }
  let Be = null;
  he(() => JSON.stringify(b.value), () => {
    !l.autoRun || l.loading || (clearTimeout(Be), Be = setTimeout(Qe, 450));
  });
  async function dt({ name: j, description: Y, folder: Q, visibility: J, copy: le = !1 } = {}) {
    const ue = l.draft, be = {
      name: (j ?? ue.name).trim() || "Untitled report",
      description: Y ?? ue.description,
      folder: (Q ?? ue.folder) || null,
      visibility: J ?? ue.visibility,
      definition: b.value
    };
    l.saving = !0;
    try {
      const me = ue.uuid && !le && ue.canEdit ? await t.reports.update(ue.uuid, be) : await t.reports.create(be);
      return Object.assign(ue, {
        uuid: me.uuid,
        name: me.name,
        description: me.description ?? "",
        folder: me.folder ?? "",
        visibility: me.visibility,
        canEdit: me.can_edit,
        canPublish: me.can_publish ?? !1,
        published: me.published ?? !1
      }), l.savedSnapshot = M(), u.success(`Saved "${me.name}".`), me;
    } catch (me) {
      throw u.error(me), me;
    } finally {
      l.saving = !1;
    }
  }
  return {
    state: l,
    definition: b,
    runnable: f,
    grouped: m,
    dirty: i,
    datasetsByKey: o,
    init: w,
    chooseRoot: _,
    changeRoot: S,
    addField: X,
    choosePath: W,
    removeItem: pe,
    moveItem: z,
    updateItem: B,
    addFormula: q,
    updateFormula: L,
    addFilter: A,
    addFilterGroup: V,
    filterOnTotal: T,
    updateFilter: re,
    removeFilter: ie,
    toggleSort: Je,
    run: Qe,
    fetchRows: Xe,
    fetchSummary: () => t.query.summary(b.value),
    exportReport: async (j) => {
      try {
        const Y = await t.query.export(b.value, j, { name: l.draft.name || "report" });
        u.success(`Exported "${Y}".`);
      } catch (Y) {
        throw u.error(Y), Y;
      }
    },
    gridKey: G(() => l.draft.uuid ? `report:${l.draft.uuid}` : null),
    cancelRunning: Ze,
    applyPath: ht,
    save: dt,
    undo: C,
    redo: h,
    canUndo: p,
    canRedo: v,
    ROW_COUNT: Mt
  };
}
const Ee = Symbol("rg-report-builder");
let Xl = 1;
function ft() {
  const t = $e([]);
  function u(g, d, b = g === "error" ? 7e3 : 3500) {
    const f = Xl++;
    t.push({ id: f, kind: g, message: d }), setTimeout(() => l(f), b);
  }
  function l(g) {
    const d = t.findIndex((b) => b.id === g);
    d !== -1 && t.splice(d, 1);
  }
  return {
    items: t,
    dismiss: l,
    success: (g) => u("success", g),
    error: (g) => u("error", typeof g == "string" ? g : (g == null ? void 0 : g.message) || "Something went wrong.")
  };
}
const en = ["onClick"], bt = {
  __name: "RgToaster",
  props: { toasts: { type: Object, required: !0 } },
  setup(t) {
    return (u, l) => (s(), ae(Zt, { to: "body" }, [
      e("div", Qt({ class: "rg-root rg-toaster" }, u.$attrs, {
        role: "status",
        "aria-live": "polite"
      }), [
        (s(!0), n(U, null, H(t.toasts.items, (g) => (s(), n("div", {
          key: g.id,
          class: ne(["rg-toast", `rg-toast--${g.kind}`])
        }, [
          E(F, {
            name: g.kind === "error" ? "alert" : "check"
          }, null, 8, ["name"]),
          e("p", null, y(g.message), 1),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
            "aria-label": "Dismiss",
            onClick: (d) => t.toasts.dismiss(g.id)
          }, [
            E(F, {
              name: "x",
              small: ""
            })
          ], 8, en)
        ], 2))), 128))
      ], 16)
    ]));
  }
}, tn = { class: "rg-topbar" }, sn = { class: "rg-topbar__title" }, ln = { class: "rg-topbar__meta" }, nn = {
  key: 0,
  class: "rg-root-chip"
}, an = { key: 1 }, on = {
  key: 2,
  class: "rg-badge"
}, rn = {
  key: 3,
  class: "rg-badge rg-badge--success"
}, un = { class: "rg-topbar__actions" }, dn = ["disabled"], cn = ["disabled"], gn = {
  class: "rg-field-inline",
  for: "rg-autorun",
  title: "Run the report as you change it"
}, mn = ["disabled"], pn = ["disabled"], vn = ["disabled"], fn = {
  __name: "BuilderTopbar",
  emits: ["save", "save-copy", "close", "publish", "pin"],
  setup(t, { emit: u }) {
    const l = u, g = ye(Ee), d = G(() => g.state.draft), b = G(() => {
      var f;
      return ((f = g.datasetsByKey.value[d.value.root]) == null ? void 0 : f.label) ?? d.value.root;
    });
    return (f, o) => (s(), n("header", tn, [
      e("div", sn, [
        o[13] || (o[13] = e("label", {
          class: "rg-sr-only",
          for: "rg-report-name"
        }, "Report name", -1)),
        se(e("input", {
          id: "rg-report-name",
          "onUpdate:modelValue": o[0] || (o[0] = (m) => d.value.name = m),
          class: "rg-input rg-input--bare rg-name-input",
          maxlength: "255"
        }, null, 512), [
          [ce, d.value.name]
        ]),
        e("div", ln, [
          d.value.root ? (s(), n("span", nn, [
            o[10] || (o[10] = N(" Report on ", -1)),
            e("b", null, y(b.value), 1),
            e("button", {
              type: "button",
              onClick: o[1] || (o[1] = (m) => R(g).changeRoot())
            }, "change")
          ])) : x("", !0),
          R(g).dirty.value ? (s(), n("span", an, [...o[11] || (o[11] = [
            e("i", {
              class: "rg-dot",
              "aria-hidden": "true"
            }, null, -1),
            N(" Unsaved changes", -1)
          ])])) : x("", !0),
          d.value.uuid && !d.value.canEdit ? (s(), n("span", on, "View only: save a copy to keep changes")) : x("", !0),
          d.value.published ? (s(), n("span", rn, [
            E(F, {
              name: "globe",
              small: ""
            }),
            o[12] || (o[12] = N(" Published", -1))
          ])) : x("", !0)
        ])
      ]),
      e("div", un, [
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--ghost rg-btn--icon",
          disabled: !R(g).canUndo(),
          "aria-label": "Undo",
          title: "Undo (Ctrl+Z)",
          onClick: o[2] || (o[2] = (m) => R(g).undo())
        }, [
          E(F, { name: "undo" })
        ], 8, dn),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--ghost rg-btn--icon",
          disabled: !R(g).canRedo(),
          "aria-label": "Redo",
          title: "Redo (Ctrl+Shift+Z)",
          onClick: o[3] || (o[3] = (m) => R(g).redo())
        }, [
          E(F, { name: "redo" })
        ], 8, cn),
        o[19] || (o[19] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
        e("label", gn, [
          se(e("input", {
            id: "rg-autorun",
            "onUpdate:modelValue": o[4] || (o[4] = (m) => R(g).state.autoRun = m),
            class: "rg-check",
            type: "checkbox"
          }, null, 512), [
            [ot, R(g).state.autoRun]
          ]),
          o[14] || (o[14] = N(" Auto-run ", -1))
        ]),
        e("button", {
          type: "button",
          class: "rg-btn",
          disabled: !R(g).runnable.value || R(g).state.running,
          title: "Run (Ctrl+Enter)",
          onClick: o[5] || (o[5] = (m) => R(g).run())
        }, [
          E(F, {
            name: "play",
            small: ""
          }),
          o[15] || (o[15] = N(" Run ", -1))
        ], 8, mn),
        o[20] || (o[20] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
        d.value.uuid ? (s(), n("button", {
          key: 0,
          type: "button",
          class: "rg-btn",
          title: "Add a chart or number from this report to a dashboard",
          onClick: o[6] || (o[6] = (m) => l("pin"))
        }, [
          E(F, {
            name: "plus",
            small: ""
          }),
          o[16] || (o[16] = N(" Pin ", -1))
        ])) : x("", !0),
        d.value.uuid && d.value.canPublish ? (s(), n("button", {
          key: 1,
          type: "button",
          class: "rg-btn",
          title: "Give roles a permission to open this report",
          onClick: o[7] || (o[7] = (m) => l("publish"))
        }, [
          E(F, {
            name: "globe",
            small: ""
          }),
          N(" " + y(d.value.published ? "Publishing" : "Publish"), 1)
        ])) : x("", !0),
        d.value.uuid ? (s(), n("button", {
          key: 2,
          type: "button",
          class: "rg-btn",
          disabled: !d.value.root,
          onClick: o[8] || (o[8] = (m) => l("save-copy"))
        }, [
          E(F, {
            name: "copy",
            small: ""
          }),
          o[17] || (o[17] = N(" Save a copy ", -1))
        ], 8, pn)) : x("", !0),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          disabled: !R(g).runnable.value || R(g).state.saving || d.value.uuid && !d.value.canEdit,
          title: "Save (Ctrl+S)",
          onClick: o[9] || (o[9] = (m) => l("save"))
        }, [
          E(F, {
            name: "save",
            small: ""
          }),
          o[18] || (o[18] = N(" Save ", -1))
        ], 8, vn)
      ])
    ]));
  }
}, bn = { class: "rg-roots" }, hn = { class: "rg-roots__bar" }, yn = {
  key: 0,
  class: "rg-topics__tabs rg-roots__tabs",
  role: "tablist",
  "aria-label": "Topic groups"
}, $n = ["aria-selected", "onClick"], _n = { class: "rg-num" }, kn = { class: "rg-search rg-roots__search" }, wn = ["onClick"], xn = { key: 0 }, Cn = { class: "rg-num rg-faint" }, Sn = {
  key: 1,
  class: "rg-muted"
}, Mn = {
  __name: "RootPicker",
  setup(t) {
    const u = ye(Ee), l = ye("rg-start-combined", null), g = ye("rg-choose-combined", null), d = K(""), b = K(null), f = { period: "Period", line: "Line", division: "Division", employee: "Employee" }, o = G(() => {
      const r = /* @__PURE__ */ new Map();
      for (const a of u.state.roots ?? []) {
        const c = a.group ?? a.label;
        r.has(c) || r.set(c, []), r.get(c).push(a);
      }
      return [...r].map(([a, c]) => ({ name: a, topics: c }));
    }), m = G(() => {
      var r;
      return b.value ?? ((r = o.value[0]) == null ? void 0 : r.name) ?? null;
    }), M = G(() => {
      var a;
      const r = d.value.trim().toLowerCase();
      return r || o.value.length < 2 ? (u.state.roots ?? []).filter((c) => !r || c.label.toLowerCase().includes(r) || c.key.includes(r)) : ((a = o.value.find((c) => c.name === m.value)) == null ? void 0 : a.topics) ?? [];
    });
    function i(r) {
      return Object.entries(r.filters ?? {}).filter(([, a]) => a).map(([a]) => f[a] ?? a);
    }
    return (r, a) => (s(), n("div", bn, [
      a[5] || (a[5] = e("div", null, [
        e("h2", null, "What is this report about?"),
        e("p", {
          class: "rg-muted",
          style: { margin: "4px 0 0" }
        }, " Pick the main topic: each row of a detailed report is one of these. Fields from related topics can be added next. ")
      ], -1)),
      e("div", hn, [
        o.value.length > 1 && !d.value ? (s(), n("nav", yn, [
          (s(!0), n(U, null, H(o.value, (c) => (s(), n("button", {
            key: c.name,
            type: "button",
            role: "tab",
            class: "rg-topics__tab",
            "aria-selected": m.value === c.name,
            onClick: (k) => b.value = c.name
          }, [
            N(y(c.name), 1),
            e("span", _n, y(c.topics.length), 1)
          ], 8, $n))), 128))
        ])) : x("", !0),
        e("label", kn, [
          a[2] || (a[2] = e("span", { class: "rg-sr-only" }, "Search topics", -1)),
          E(F, { name: "search" }),
          se(e("input", {
            id: "rg-root-search",
            "onUpdate:modelValue": a[0] || (a[0] = (c) => d.value = c),
            class: "rg-input",
            type: "search",
            placeholder: "Search topics",
            autocomplete: "off"
          }, null, 512), [
            [ce, d.value]
          ])
        ])
      ]),
      R(l) && R(g) && !d.value ? (s(), n("button", {
        key: 0,
        type: "button",
        class: "rg-root-card rg-root-card--combine",
        onClick: a[1] || (a[1] = (c) => R(g)())
      }, [
        e("b", null, [
          E(F, {
            name: "table",
            small: ""
          }),
          a[3] || (a[3] = N(" Combine existing reports", -1))
        ]),
        a[4] || (a[4] = e("span", null, "Put columns of reports you already use side by side, one row per employee or per division, and add formulas across them.", -1))
      ])) : x("", !0),
      E(lt, {
        tag: "div",
        name: "rg-list-fade",
        class: "rg-roots__grid"
      }, {
        default: de(() => [
          (s(!0), n(U, null, H(M.value, (c) => (s(), n("button", {
            key: c.key,
            type: "button",
            class: "rg-root-card",
            onClick: (k) => R(u).chooseRoot(c.key)
          }, [
            e("b", null, y(c.label), 1),
            c.description ? (s(), n("span", xn, y(c.description), 1)) : x("", !0),
            e("span", Cn, [
              N(y(c.fields_count) + " fields", 1),
              i(c).length ? (s(), n(U, { key: 0 }, [
                N(" · by " + y(i(c).join(", ")), 1)
              ], 64)) : x("", !0)
            ])
          ], 8, wn))), 128))
        ]),
        _: 1
      }),
      R(u).state.roots && !M.value.length ? (s(), n("p", Sn, y(d.value ? "No topic matches your search." : "There are no topics you can report on yet. Ask an admin for access."), 1)) : x("", !0)
    ]));
  }
}, Tn = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }), En = new Intl.NumberFormat("en"), On = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function je(t) {
  return t == null ? "—" : t < 1e4 ? En.format(t) : Tn.format(t);
}
const Rn = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function Kt(t, u = Date.now()) {
  if (!t) return "";
  const l = Math.round((new Date(t).getTime() - u) / 1e3);
  for (const [g, d] of Rn)
    if (Math.abs(l) >= d) return On.format(Math.round(l / d), g);
  return "just now";
}
const Dn = {
  class: "rg-explorer",
  "aria-label": "Fields"
}, An = { class: "rg-explorer__head" }, Ln = { class: "rg-search" }, Nn = { class: "rg-explorer__list" }, Vn = ["aria-expanded", "onClick"], Pn = { class: "rg-ds__meta" }, Fn = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, qn = ["title"], In = {
  key: 2,
  class: "rg-badge rg-badge--warning",
  title: "Reachable in more than one way: you will be asked which"
}, Un = {
  class: "rg-faint rg-num",
  style: { "font-size": "11px" }
}, jn = {
  key: 0,
  class: "rg-ds__fields"
}, zn = ["title", "onDragstart", "onDblclick"], Bn = { class: "rg-fld__label" }, Gn = { class: "rg-fld__actions" }, Kn = ["aria-label", "onClick"], Hn = ["aria-label", "onClick"], Wn = {
  key: 0,
  class: "rg-list__empty"
}, Yn = {
  __name: "FieldExplorer",
  setup(t) {
    const u = ye(Ee), l = K(""), g = K({}), d = G(() => {
      var r;
      const i = l.value.trim().toLowerCase();
      return (((r = u.state.catalog) == null ? void 0 : r.datasets) ?? []).map((a) => {
        const c = i ? a.fields.filter((k) => k.label.toLowerCase().includes(i) || a.label.toLowerCase().includes(i)) : a.fields;
        return { dataset: a, fields: c, isRoot: a.key === u.state.draft.root };
      }).filter((a) => a.fields.length);
    });
    function b(i) {
      return l.value.trim() !== "" || (g.value[i.dataset.key] ?? i.isRoot);
    }
    function f(i, r) {
      g.value = { ...g.value, [i]: !b(r) };
    }
    function o(i, r, a) {
      i.dataTransfer.effectAllowed = "copy", i.dataTransfer.setData("application/x-rg", JSON.stringify({ kind: "field", dataset: r.key, field: a.key })), i.dataTransfer.setData("text/plain", a.label);
    }
    function m(i) {
      return `rg-role rg-role--${i.role}`;
    }
    function M(i) {
      var r;
      return (r = i.paths) == null ? void 0 : r.some((a) => a.multiplies_rows);
    }
    return (i, r) => (s(), n("aside", Dn, [
      e("div", An, [
        e("label", Ln, [
          r[1] || (r[1] = e("span", { class: "rg-sr-only" }, "Search fields", -1)),
          E(F, { name: "search" }),
          se(e("input", {
            id: "rg-field-search",
            "onUpdate:modelValue": r[0] || (r[0] = (a) => l.value = a),
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
      e("div", Nn, [
        (s(!0), n(U, null, H(d.value, (a) => {
          var c, k;
          return s(), n("section", {
            key: a.dataset.key,
            class: "rg-ds"
          }, [
            e("button", {
              type: "button",
              class: "rg-ds__head",
              "aria-expanded": b(a) ? "true" : "false",
              onClick: (C) => f(a.dataset.key, a)
            }, [
              E(F, {
                name: "chevron",
                small: "",
                class: "rg-chev"
              }),
              e("span", null, y(a.dataset.label), 1),
              e("span", Pn, [
                a.isRoot ? (s(), n("span", Fn, "report")) : M(a.dataset) ? (s(), n("span", {
                  key: 1,
                  class: "rg-badge",
                  title: `Several ${a.dataset.label} per ${(c = R(u).datasetsByKey.value[R(u).state.draft.root]) == null ? void 0 : c.label}`
                }, "many", 8, qn)) : x("", !0),
                ((k = a.dataset.paths) == null ? void 0 : k.length) > 1 ? (s(), n("span", In, y(a.dataset.paths.length) + " ways", 1)) : x("", !0),
                e("span", Un, y(R(je)(a.dataset.row_estimate)), 1)
              ])
            ], 8, Vn),
            b(a) ? (s(), n("ul", jn, [
              (s(!0), n(U, null, H(a.fields, (C) => (s(), n("li", {
                key: C.key,
                class: "rg-fld",
                draggable: "true",
                title: `${C.label} (${C.type})`,
                onDragstart: (h) => o(h, a.dataset, C),
                onDblclick: (h) => R(u).addField(a.dataset.key, C.key)
              }, [
                e("span", {
                  class: ne(m(C))
                }, [
                  E(F, {
                    name: C.key === "__rows" ? "hash" : R(St)[C.type] || "text",
                    small: "",
                    class: "rg-fld__icon"
                  }, null, 8, ["name"])
                ], 2),
                e("span", Bn, y(C.label), 1),
                e("span", Gn, [
                  e("button", {
                    type: "button",
                    class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
                    "aria-label": `Add ${C.label}`,
                    title: "Add",
                    onClick: (h) => R(u).addField(a.dataset.key, C.key)
                  }, [
                    E(F, {
                      name: "plus",
                      small: ""
                    })
                  ], 8, Kn),
                  C.key !== "__rows" ? (s(), n("button", {
                    key: 0,
                    type: "button",
                    class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
                    "aria-label": `Filter by ${C.label}`,
                    title: "Filter by this",
                    onClick: (h) => R(u).addField(a.dataset.key, C.key, "filters")
                  }, [
                    E(F, {
                      name: "filter",
                      small: ""
                    })
                  ], 8, Hn)) : x("", !0)
                ])
              ], 40, zn))), 128))
            ])) : x("", !0)
          ]);
        }), 128)),
        d.value.length ? x("", !0) : (s(), n("p", Wn, "No field matches “" + y(l.value) + "”.", 1))
      ])
    ]));
  }
}, Et = {
  __name: "RgPopover",
  emits: ["close"],
  setup(t, { emit: u }) {
    const l = u, g = K(null);
    function d(f) {
      var o;
      g.value && !((o = g.value.parentElement) != null && o.contains(f.target)) && l("close");
    }
    function b(f) {
      f.key === "Escape" && l("close");
    }
    return Se(() => {
      var f, o;
      setTimeout(() => document.addEventListener("mousedown", d), 0), document.addEventListener("keydown", b), (o = (f = g.value) == null ? void 0 : f.querySelector("input, select, textarea, button")) == null || o.focus();
    }), Ne(() => {
      document.removeEventListener("mousedown", d), document.removeEventListener("keydown", b);
    }), (f, o) => (s(), n("div", {
      ref_key: "panel",
      ref: g,
      class: "rg-pop",
      role: "dialog",
      onClick: o[0] || (o[0] = ge(() => {
      }, ["stop"]))
    }, [
      rt(f.$slots, "default")
    ], 512));
  }
}, Jn = { class: "rg-chip-wrap" }, Zn = ["aria-label", "title"], Qn = { class: "rg-chip__label" }, Xn = {
  key: 1,
  class: "rg-chip__tag"
}, ea = ["aria-label"], ta = ["for"], sa = ["id", "value"], la = ["for"], na = ["id", "value"], aa = ["value"], oa = ["for"], ra = ["id", "value"], ia = ["value"], ua = ["for"], da = ["id", "value"], ca = {
  key: 3,
  class: "rg-faint",
  style: { margin: "0", "font-size": "11.5px" }
}, ga = { class: "rg-pop__foot" }, ma = { class: "rg-pop__row" }, pa = {
  __name: "FieldChip",
  props: {
    item: { type: Object, required: !0 },
    shelf: { type: String, required: !0 }
  },
  emits: ["edit-formula"],
  setup(t, { emit: u }) {
    const l = t, g = u, d = ye(Ee), b = K(!1), f = K(!1), o = [
      [null, "Exact value"],
      ["day", "Day"],
      ["week", "Week"],
      ["month", "Month"],
      ["quarter", "Quarter"],
      ["year", "Year"],
      ["month_of_year", "Month of year"],
      ["day_of_week", "Day of week"]
    ], m = G(() => ["date", "datetime"].includes(l.item.type)), M = G(() => l.item.kind === "formula" ? "rg-chip--formula" : `rg-role rg-role--${l.item.kind === "measure" ? "measure" : l.item.role === "time" ? "time" : "dimension"}`), i = G(() => {
      var h;
      return l.item.kind === "formula" ? "fx" : l.item.kind === "measure" ? l.item.field === "__rows" ? "#" : pt[l.item.agg] : l.item.grain ? (h = o.find(([p]) => p === l.item.grain)) == null ? void 0 : h[1] : "";
    }), r = G(() => d.state.errorUid === l.item.uid);
    function a(h) {
      f.value = !0, h.dataTransfer.effectAllowed = "move", h.dataTransfer.setData("application/x-rg", JSON.stringify({ kind: "item", uid: l.item.uid })), h.dataTransfer.setData("text/plain", l.item.label);
    }
    function c(h) {
      d.updateItem(l.item.uid, h);
    }
    function k(h) {
      d.moveItem(l.item.uid, h), b.value = !1;
    }
    function C(h) {
      const v = d.state.draft[l.shelf].findIndex((w) => w.uid === l.item.uid);
      d.moveItem(l.item.uid, l.shelf, Math.max(0, v + h));
    }
    return (h, p) => (s(), n("div", Jn, [
      e("span", {
        class: ne(["rg-chip", [M.value, { "rg-chip--error": r.value, "rg-chip--dragging": f.value }]]),
        draggable: "true",
        role: "button",
        tabindex: "0",
        "aria-label": `${t.item.label}: open options`,
        title: t.item.missing ? "This field is no longer in the data model" : t.item.label,
        onDragstart: a,
        onDragend: p[1] || (p[1] = (v) => f.value = !1),
        onClick: p[2] || (p[2] = (v) => b.value = !b.value),
        onKeydown: [
          p[3] || (p[3] = Ie(ge((v) => b.value = !b.value, ["prevent"]), ["enter"])),
          p[4] || (p[4] = Ie((v) => R(d).removeItem(t.item.uid), ["delete"])),
          p[5] || (p[5] = Ie(ge((v) => C(-1), ["alt", "prevent"]), ["left"])),
          p[6] || (p[6] = Ie(ge((v) => C(1), ["alt", "prevent"]), ["right"]))
        ]
      }, [
        t.item.missing ? (s(), ae(F, {
          key: 0,
          name: "alert",
          small: ""
        })) : x("", !0),
        e("span", Qn, y(t.item.label), 1),
        i.value ? (s(), n("span", Xn, y(i.value), 1)) : x("", !0),
        e("button", {
          type: "button",
          class: "rg-chip__x",
          "aria-label": `Remove ${t.item.label}`,
          onClick: p[0] || (p[0] = ge((v) => R(d).removeItem(t.item.uid), ["stop"]))
        }, [
          E(F, {
            name: "x",
            small: ""
          })
        ], 8, ea)
      ], 42, Zn),
      b.value ? (s(), ae(Et, {
        key: 0,
        onClose: p[16] || (p[16] = (v) => b.value = !1)
      }, {
        default: de(() => [
          e("label", {
            for: `rg-chip-label-${t.item.uid}`
          }, [
            p[17] || (p[17] = N(" Column name ", -1)),
            e("input", {
              id: `rg-chip-label-${t.item.uid}`,
              class: "rg-input",
              value: t.item.label,
              maxlength: "120",
              onChange: p[7] || (p[7] = (v) => c({ label: v.target.value }))
            }, null, 40, sa)
          ], 8, ta),
          t.item.kind === "measure" && t.item.field !== "__rows" ? (s(), n("label", {
            key: 0,
            for: `rg-chip-agg-${t.item.uid}`
          }, [
            p[18] || (p[18] = N(" Calculate ", -1)),
            e("select", {
              id: `rg-chip-agg-${t.item.uid}`,
              class: "rg-select",
              value: t.item.agg,
              onChange: p[8] || (p[8] = (v) => c({ agg: v.target.value }))
            }, [
              (s(!0), n(U, null, H(t.item.aggregations, (v) => (s(), n("option", {
                key: v,
                value: v
              }, y(R(pt)[v]), 9, aa))), 128))
            ], 40, na)
          ], 8, la)) : x("", !0),
          t.item.kind === "dimension" && m.value ? (s(), n("label", {
            key: 1,
            for: `rg-chip-grain-${t.item.uid}`
          }, [
            p[19] || (p[19] = N(" Group dates by ", -1)),
            e("select", {
              id: `rg-chip-grain-${t.item.uid}`,
              class: "rg-select",
              value: t.item.grain ?? "",
              onChange: p[9] || (p[9] = (v) => c({ grain: v.target.value || null }))
            }, [
              (s(), n(U, null, H(o, ([v, w]) => e("option", {
                key: w,
                value: v ?? ""
              }, y(w), 9, ia)), 64))
            ], 40, ra)
          ], 8, oa)) : x("", !0),
          t.item.kind !== "dimension" ? (s(), n("label", {
            key: 2,
            for: `rg-chip-format-${t.item.uid}`
          }, [
            p[20] || (p[20] = N(" Number format ", -1)),
            e("input", {
              id: `rg-chip-format-${t.item.uid}`,
              class: "rg-input rg-mono",
              value: t.item.format ?? "",
              placeholder: "#,##0.00 or 0.0%",
              maxlength: "64",
              onChange: p[10] || (p[10] = (v) => c({ format: v.target.value || null }))
            }, null, 40, da)
          ], 8, ua)) : x("", !0),
          t.item.path ? (s(), n("p", ca, "Uses a chosen join path.")) : x("", !0),
          e("div", ga, [
            e("div", ma, [
              t.item.kind === "formula" ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: p[11] || (p[11] = (v) => {
                  g("edit-formula", t.item), b.value = !1;
                })
              }, [
                E(F, {
                  name: "fx",
                  small: ""
                }),
                p[21] || (p[21] = N(" Edit formula ", -1))
              ])) : x("", !0),
              t.item.kind !== "dimension" ? (s(), n("button", {
                key: 1,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: p[12] || (p[12] = (v) => {
                  R(d).filterOnTotal(t.item.uid), b.value = !1;
                })
              }, [
                E(F, {
                  name: "filter",
                  small: ""
                }),
                p[22] || (p[22] = N(" Filter on this ", -1))
              ])) : x("", !0),
              t.shelf === "values" && t.item.kind === "measure" && t.item.field !== "__rows" ? (s(), n("button", {
                key: 2,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: p[13] || (p[13] = (v) => k("rows"))
              }, "Move to Rows")) : x("", !0),
              t.shelf === "rows" ? (s(), n("button", {
                key: 3,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: p[14] || (p[14] = (v) => k("values"))
              }, "Move to Values")) : x("", !0)
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--danger rg-btn--ghost",
              onClick: p[15] || (p[15] = (v) => R(d).removeItem(t.item.uid))
            }, "Remove")
          ])
        ]),
        _: 1
      })) : x("", !0)
    ]));
  }
}, va = { class: "rg-shelf" }, fa = { class: "rg-shelf__title" }, ba = ["aria-label"], ha = {
  key: 0,
  class: "rg-drop-marker"
}, ya = {
  key: 0,
  class: "rg-drop-marker"
}, $a = {
  key: 1,
  class: "rg-shelf__empty"
}, Ht = {
  __name: "ShelfDrop",
  props: {
    shelf: { type: String, required: !0 },
    title: { type: String, required: !0 },
    empty: { type: String, required: !0 }
  },
  emits: ["edit-formula"],
  setup(t, { emit: u }) {
    const l = t, g = u, d = ye(Ee), b = K(!1), f = K(null), o = K(null);
    function m(a) {
      try {
        return JSON.parse(a.dataTransfer.getData("application/x-rg"));
      } catch {
        return null;
      }
    }
    function M(a) {
      var C;
      const c = [...((C = o.value) == null ? void 0 : C.querySelectorAll(".rg-chip-wrap")) ?? []], k = getComputedStyle(o.value).direction === "rtl";
      for (let h = 0; h < c.length; h++) {
        const p = c[h].getBoundingClientRect(), v = p.left + p.width / 2, w = k ? a.clientX > v : a.clientX < v;
        if (a.clientY < p.bottom && w) return h;
      }
      return c.length;
    }
    function i(a) {
      [...a.dataTransfer.types].includes("application/x-rg") && (a.preventDefault(), b.value = !0, f.value = M(a));
    }
    function r(a) {
      const c = m(a), k = f.value;
      b.value = !1, f.value = null, c && (c.kind === "field" && d.addField(c.dataset, c.field, l.shelf, k), c.kind === "item" && d.moveItem(c.uid, l.shelf, k));
    }
    return (a, c) => (s(), n("div", va, [
      e("span", fa, y(t.title), 1),
      e("div", {
        ref_key: "zone",
        ref: o,
        class: ne(["rg-shelf__drop", { "rg-shelf__drop--over": b.value }]),
        "aria-label": `${t.title} shelf`,
        onDragover: i,
        onDragleave: c[1] || (c[1] = ge((k) => {
          b.value = !1, f.value = null;
        }, ["self"])),
        onDrop: ge(r, ["prevent"])
      }, [
        (s(!0), n(U, null, H(R(d).state.draft[t.shelf], (k, C) => (s(), n(U, {
          key: k.uid
        }, [
          b.value && f.value === C ? (s(), n("span", ha)) : x("", !0),
          E(pa, {
            item: k,
            shelf: t.shelf,
            onEditFormula: c[0] || (c[0] = (h) => g("edit-formula", h))
          }, null, 8, ["item", "shelf"])
        ], 64))), 128)),
        b.value && f.value === R(d).state.draft[t.shelf].length ? (s(), n("span", ya)) : x("", !0),
        !R(d).state.draft[t.shelf].length && !b.value ? (s(), n("span", $a, y(t.empty), 1)) : x("", !0),
        rt(a.$slots, "default")
      ], 42, ba)
    ]));
  }
}, _a = ["aria-label", "onClick"], ka = ["id", "inputmode", "placeholder"], wa = {
  key: 0,
  class: "rg-suggest",
  role: "listbox"
}, xa = ["onMousedown"], Ca = {
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
    const l = t, g = u, { api: d } = Le(), b = K(""), f = K([]), o = K(!1);
    let m = null, M = 0;
    function i(k) {
      const C = l.numeric ? Number(k) : String(k).trim();
      C === "" || l.numeric && Number.isNaN(C) || (l.modelValue.includes(C) || g("update:modelValue", [...l.modelValue, C]), b.value = "", o.value = !1);
    }
    function r(k) {
      g("update:modelValue", l.modelValue.filter((C) => C !== k));
    }
    he(b, (k) => {
      clearTimeout(m), l.field && (m = setTimeout(async () => {
        const C = ++M;
        try {
          const h = await d.query.values(l.field, k, 30);
          C === M && (f.value = h.filter((p) => !l.modelValue.includes(p)), o.value = !0);
        } catch {
          f.value = [];
        }
      }, 250));
    }), Ne(() => clearTimeout(m));
    function a() {
      setTimeout(() => o.value = !1, 150);
    }
    function c(k) {
      k.key === "Enter" || k.key === "," ? (k.preventDefault(), i(b.value)) : k.key === "Backspace" && !b.value && l.modelValue.length ? r(l.modelValue[l.modelValue.length - 1]) : k.key === "Escape" && (o.value = !1);
    }
    return (k, C) => (s(), n("span", {
      class: "rg-tags",
      onClick: C[2] || (C[2] = (h) => {
        var p;
        return (p = h.currentTarget.querySelector("input")) == null ? void 0 : p.focus();
      })
    }, [
      (s(!0), n(U, null, H(t.modelValue, (h) => (s(), n("span", {
        key: String(h),
        class: "rg-tag"
      }, [
        N(y(h) + " ", 1),
        e("button", {
          type: "button",
          "aria-label": `Remove ${h}`,
          onClick: ge((p) => r(h), ["stop"])
        }, "×", 8, _a)
      ]))), 128)),
      se(e("input", {
        id: t.inputId,
        "onUpdate:modelValue": C[0] || (C[0] = (h) => b.value = h),
        inputmode: t.numeric ? "decimal" : "text",
        placeholder: t.modelValue.length ? "" : t.field ? "Type to search" : "Type and press Enter",
        autocomplete: "off",
        onKeydown: c,
        onFocus: C[1] || (C[1] = (h) => t.field && (b.value = b.value)),
        onBlur: a
      }, null, 40, ka), [
        [ce, b.value]
      ]),
      o.value && f.value.length ? (s(), n("ul", wa, [
        (s(!0), n(U, null, H(f.value, (h) => (s(), n("li", {
          key: String(h)
        }, [
          e("button", {
            type: "button",
            role: "option",
            onMousedown: ge((p) => i(h), ["prevent"])
          }, y(h), 41, xa)
        ]))), 128))
      ])) : x("", !0)
    ]));
  }
}, Sa = ["id", "value"], Ma = ["id", "value"], Ta = ["value"], Ea = ["id", "value"], Oa = ["id", "value"], Ra = ["id", "type", "value"], Da = ["id", "type", "value"], Aa = ["id", "type", "value"], La = {
  __name: "FilterValue",
  props: { node: { type: Object, required: !0 } },
  emits: ["update"],
  setup(t, { emit: u }) {
    const l = t, g = u, d = G(() => ["date", "datetime"].includes(l.node.type)), b = G(() => ["integer", "decimal"].includes(l.node.type) || l.node.isTotal), f = G(() => d.value ? "date" : b.value ? "number" : "text"), o = G(() => typeof l.node.value == "string" && zt.some(([a]) => a === l.node.value)), m = (a) => `rg-filter-${l.node.uid}-${a}`;
    function M(a) {
      g("update", { value: a });
    }
    function i(a, c) {
      const k = Array.isArray(l.node.value) ? [...l.node.value] : ["", ""];
      k[a] = b.value && c !== "" ? Number(c) : c, M(k);
    }
    function r(a) {
      M(b.value && a !== "" ? Number(a) : a);
    }
    return (a, c) => {
      var k, C, h, p;
      return ["is_null", "not_null"].includes(t.node.op) ? (s(), n(U, { key: 0 }, [], 64)) : t.node.type === "boolean" ? (s(), n("select", {
        key: 1,
        id: m("bool"),
        class: "rg-select",
        value: t.node.value === null ? "" : String(t.node.value),
        "aria-label": "Value",
        onChange: c[0] || (c[0] = (v) => M(v.target.value === "true"))
      }, [...c[7] || (c[7] = [
        e("option", {
          value: "",
          disabled: ""
        }, "Choose", -1),
        e("option", { value: "true" }, "Yes", -1),
        e("option", { value: "false" }, "No", -1)
      ])], 40, Sa)) : t.node.op === "between" && d.value ? (s(), n(U, { key: 2 }, [
        e("select", {
          id: m("preset"),
          class: "rg-select",
          value: o.value ? t.node.value : "custom",
          "aria-label": "Date range",
          onChange: c[1] || (c[1] = (v) => M(v.target.value === "custom" ? ["", ""] : v.target.value))
        }, [
          (s(!0), n(U, null, H(R(zt), ([v, w]) => (s(), n("option", {
            key: v,
            value: v
          }, y(w), 9, Ta))), 128)),
          c[8] || (c[8] = e("option", { value: "custom" }, "Custom range…", -1))
        ], 40, Ma),
        o.value ? x("", !0) : (s(), n(U, { key: 0 }, [
          e("input", {
            id: m("from"),
            class: "rg-input",
            type: "date",
            "aria-label": "From",
            value: ((k = t.node.value) == null ? void 0 : k[0]) ?? "",
            onChange: c[2] || (c[2] = (v) => i(0, v.target.value))
          }, null, 40, Ea),
          c[9] || (c[9] = e("span", { class: "rg-faint" }, "to", -1)),
          e("input", {
            id: m("to"),
            class: "rg-input",
            type: "date",
            "aria-label": "To",
            value: ((C = t.node.value) == null ? void 0 : C[1]) ?? "",
            onChange: c[3] || (c[3] = (v) => i(1, v.target.value))
          }, null, 40, Oa)
        ], 64))
      ], 64)) : t.node.op === "between" ? (s(), n(U, { key: 3 }, [
        e("input", {
          id: m("from"),
          class: "rg-input",
          type: f.value,
          "aria-label": "From",
          style: { width: "110px" },
          value: ((h = t.node.value) == null ? void 0 : h[0]) ?? "",
          onChange: c[4] || (c[4] = (v) => i(0, v.target.value))
        }, null, 40, Ra),
        c[10] || (c[10] = e("span", { class: "rg-faint" }, "and", -1)),
        e("input", {
          id: m("to"),
          class: "rg-input",
          type: f.value,
          "aria-label": "To",
          style: { width: "110px" },
          value: ((p = t.node.value) == null ? void 0 : p[1]) ?? "",
          onChange: c[5] || (c[5] = (v) => i(1, v.target.value))
        }, null, 40, Da)
      ], 64)) : ["in", "not_in"].includes(t.node.op) ? (s(), ae(Ca, {
        key: 4,
        "input-id": m("list"),
        "model-value": Array.isArray(t.node.value) ? t.node.value : [],
        field: t.node.target.includes(".") ? t.node.target : null,
        numeric: b.value,
        "onUpdate:modelValue": M
      }, null, 8, ["input-id", "model-value", "field", "numeric"])) : (s(), n("input", {
        key: 5,
        id: m("value"),
        class: "rg-input",
        type: f.value,
        "aria-label": "Value",
        style: Me({ width: d.value ? "auto" : "160px" }),
        value: t.node.value ?? "",
        onChange: c[6] || (c[6] = (v) => r(v.target.value))
      }, null, 44, Aa));
    };
  }
}, Na = {
  key: 0,
  class: "rg-filter-row"
}, Va = {
  class: "rg-bool-toggle",
  role: "group",
  "aria-label": "How filters combine"
}, Pa = ["aria-pressed"], Fa = ["aria-pressed"], qa = ["title"], Ia = ["id", "value", "onChange"], Ua = ["value"], ja = ["aria-label", "onClick"], za = {
  key: 1,
  class: "rg-faint",
  style: { margin: "0", "font-size": "12px" }
}, Ba = /* @__PURE__ */ Object.assign({ name: "FilterGroupView" }, {
  __name: "FilterGroupView",
  props: {
    group: { type: Object, required: !0 },
    nested: { type: Boolean, default: !1 }
  },
  setup(t) {
    const u = t, l = ye(Ee);
    function g(b) {
      u.group.boolean = b;
    }
    function d(b) {
      let f = null;
      try {
        f = JSON.parse(b.dataTransfer.getData("application/x-rg"));
      } catch {
        return;
      }
      (f == null ? void 0 : f.kind) === "field" && l.addField(f.dataset, f.field, "filters", null, void 0, u.group.uid);
    }
    return (b, f) => {
      const o = hs("FilterGroupView", !0);
      return s(), n("div", {
        class: ne(t.nested ? "rg-filter-group" : "rg-filters"),
        onDragover: f[3] || (f[3] = (m) => t.nested && [...m.dataTransfer.types].includes("application/x-rg") && m.preventDefault()),
        onDrop: f[4] || (f[4] = ge((m) => t.nested && (m.preventDefault(), d(m)), ["stop"]))
      }, [
        t.group.items.length > 1 || t.nested ? (s(), n("div", Na, [
          f[5] || (f[5] = e("span", {
            class: "rg-faint",
            style: { "font-size": "12px" }
          }, "Match", -1)),
          e("span", Va, [
            e("button", {
              type: "button",
              "aria-pressed": t.group.boolean === "and" ? "true" : "false",
              onClick: f[0] || (f[0] = (m) => g("and"))
            }, "ALL", 8, Pa),
            e("button", {
              type: "button",
              "aria-pressed": t.group.boolean === "or" ? "true" : "false",
              onClick: f[1] || (f[1] = (m) => g("or"))
            }, "ANY", 8, Fa)
          ]),
          f[6] || (f[6] = e("span", {
            class: "rg-faint",
            style: { "font-size": "12px" }
          }, "of these", -1)),
          t.nested ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn rg-btn--ghost rg-btn--sm",
            style: { "margin-inline-start": "auto" },
            onClick: f[2] || (f[2] = (m) => R(l).removeFilter(t.group.uid))
          }, "Remove group")) : x("", !0)
        ])) : x("", !0),
        (s(!0), n(U, null, H(t.group.items, (m) => (s(), n(U, {
          key: m.uid
        }, [
          m.items ? (s(), ae(o, {
            key: 0,
            group: m,
            nested: ""
          }, null, 8, ["group"])) : (s(), n("div", {
            key: 1,
            class: ne(["rg-filter-row", { "rg-filter-row--error": R(l).state.errorUid === m.uid }])
          }, [
            e("span", {
              class: "rg-filter-field",
              title: m.target
            }, [
              m.isTotal ? (s(), ae(F, {
                key: 0,
                name: "hash",
                small: ""
              })) : x("", !0),
              N(" " + y(m.label), 1)
            ], 8, qa),
            e("select", {
              id: `rg-filter-${m.uid}-op`,
              class: "rg-select",
              "aria-label": "Condition",
              value: m.op,
              onChange: (M) => R(l).updateFilter(m, { op: M.target.value })
            }, [
              (s(!0), n(U, null, H(R(es)(m.type, m.isTotal), (M) => (s(), n("option", {
                key: M,
                value: M
              }, y(R(ql)[M]), 9, Ua))), 128))
            ], 40, Ia),
            E(La, {
              node: m,
              onUpdate: (M) => R(l).updateFilter(m, M)
            }, null, 8, ["node", "onUpdate"]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
              "aria-label": `Remove filter on ${m.label}`,
              onClick: (M) => R(l).removeFilter(m.uid)
            }, [
              E(F, {
                name: "x",
                small: ""
              })
            ], 8, ja)
          ], 2))
        ], 64))), 128)),
        t.nested && !t.group.items.length ? (s(), n("p", za, " Drop fields here to add conditions to this group. ")) : x("", !0)
      ], 34);
    };
  }
}), kt = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], Ga = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], wt = /* @__PURE__ */ new Map();
function Wt(t, u, l) {
  const g = `${t}|${u}|${l}`;
  return wt.has(g) || wt.set(g, new Intl.NumberFormat("en", {
    minimumFractionDigits: t,
    maximumFractionDigits: t,
    useGrouping: u,
    style: l ? "percent" : "decimal"
  })), wt.get(g);
}
function Ka(t) {
  if (!t) return null;
  const u = t.includes("%"), l = t.includes(",");
  return { decimals: (t.split(".")[1] ?? "").replace(/[^0#]/g, "").length, grouping: l, percent: u };
}
function as(t, u, l = "decimal") {
  const g = typeof t == "number" ? t : Number(t);
  if (!Number.isFinite(g)) return String(t);
  const d = Ka(u);
  if (d) return Wt(d.decimals, d.grouping, d.percent).format(g);
  const b = l === "integer" || Number.isInteger(g) ? 0 : 2;
  return Wt(b, !0, !1).format(g);
}
function Ha(t) {
  const u = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(t));
  return u ? { year: +u[1], month: +u[2], day: +u[3], hour: u[4] !== void 0 ? +u[4] : null, minute: u[5] !== void 0 ? +u[5] : null } : null;
}
function Wa(t, u = null, l = "date") {
  if (u === "month_of_year") return kt[(+t - 1) % 12] ?? String(t);
  if (u === "day_of_week") return Ga[(+t - 1) % 7] ?? String(t);
  if (u === "hour_of_day") return `${String(t).padStart(2, "0")}:00`;
  const g = Ha(t);
  if (!g) return String(t);
  const d = `${g.day} ${kt[g.month - 1]} ${g.year}`;
  switch (u) {
    case "year":
      return String(g.year);
    case "quarter":
      return `Q${Math.floor((g.month - 1) / 3) + 1} ${g.year}`;
    case "month":
      return `${kt[g.month - 1]} ${g.year}`;
    case "week":
      return `Week of ${d}`;
    case "hour":
      return `${d}, ${String(g.hour ?? 0).padStart(2, "0")}:00`;
    case "day":
      return d;
    default:
      return l === "datetime" && g.hour !== null ? `${d}, ${String(g.hour).padStart(2, "0")}:${String(g.minute).padStart(2, "0")}` : d;
  }
}
function ke(t, u) {
  return t == null || t === "" ? u.kind === "measure" ? "–" : "(empty)" : u.grain || u.type === "date" || u.type === "datetime" ? Wa(t, u.grain, u.type) : u.type === "boolean" ? t === !0 || t === 1 || t === "1" || t === "t" ? "Yes" : "No" : u.type === "integer" || u.type === "decimal" || u.kind === "measure" ? as(t, u.format, u.type) : String(t);
}
function We(t) {
  return !t.grain && (t.kind === "measure" || t.type === "integer" || t.type === "decimal");
}
const Ya = {
  class: "rg-gridbar",
  role: "toolbar",
  "aria-label": "Grid"
}, Ja = {
  class: "rg-gridbar__group",
  style: { position: "relative" }
}, Za = ["aria-expanded"], Qa = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, Xa = ["onDragstart", "onDrop"], eo = ["checked", "onChange"], to = { class: "rg-colchooser__moves" }, so = ["aria-label", "disabled", "onClick"], lo = ["aria-label", "disabled", "onClick"], no = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Row height"
}, ao = ["aria-pressed"], oo = ["aria-pressed"], ro = ["aria-pressed"], io = ["aria-pressed"], uo = { class: "rg-gridbar__group rg-gridbar__end" }, co = ["title"], go = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Browse"
}, mo = ["aria-pressed"], po = ["aria-pressed", "disabled", "title"], vo = ["disabled"], fo = ["disabled"], bo = {
  __name: "GridToolbar",
  props: {
    columns: { type: Array, required: !0 },
    prefs: { type: Object, required: !0 },
    grouped: { type: Boolean, default: !1 },
    canExport: { type: Boolean, default: !1 },
    canTotal: { type: Boolean, default: !1 },
    exporting: { type: String, default: null },
    summary: { type: Object, default: null },
    summaryLoading: { type: Boolean, default: !1 }
  },
  emits: ["export", "autosize"],
  setup(t, { emit: u }) {
    const l = t, g = u, d = K(!1), b = K(null), f = G(() => l.columns.filter((r) => l.prefs.hidden.includes(r.alias)).length);
    function o(r) {
      const a = l.prefs.hidden;
      l.prefs.hidden = a.includes(r) ? a.filter((c) => c !== r) : [...a, r];
    }
    function m(r, a) {
      const c = l.columns.map((C) => C.alias), k = c.indexOf(r);
      k === -1 || a < 0 || a >= c.length || k === a || (c.splice(a, 0, c.splice(k, 1)[0]), l.prefs.order = c);
    }
    function M(r) {
      b.value !== null && (m(b.value, l.columns.findIndex((a) => a.alias === r)), b.value = null);
    }
    function i() {
      Object.assign(l.prefs, { hidden: [], order: [], widths: {} });
    }
    return (r, a) => (s(), n("div", Ya, [
      e("div", Ja, [
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--sm",
          "aria-expanded": d.value,
          onClick: a[0] || (a[0] = (c) => d.value = !d.value)
        }, [
          E(F, {
            name: "table",
            small: ""
          }),
          a[12] || (a[12] = N(" Columns ", -1)),
          f.value ? (s(), n("span", Qa, y(f.value) + " hidden", 1)) : x("", !0)
        ], 8, Za),
        d.value ? (s(), ae(Et, {
          key: 0,
          class: "rg-colchooser",
          onClose: a[3] || (a[3] = (c) => d.value = !1)
        }, {
          default: de(() => [
            e("div", { class: "rg-colchooser__head" }, [
              a[13] || (a[13] = e("b", null, "Columns", -1)),
              e("button", {
                type: "button",
                class: "rg-linkish",
                onClick: i
              }, "Reset")
            ]),
            E(lt, {
              tag: "ul",
              name: "rg-list-move",
              class: "rg-colchooser__list"
            }, {
              default: de(() => [
                (s(!0), n(U, null, H(t.columns, (c, k) => (s(), n("li", {
                  key: c.alias,
                  draggable: "true",
                  class: ne({ "is-dragging": b.value === c.alias }),
                  onDragstart: (C) => b.value = c.alias,
                  onDragend: a[1] || (a[1] = (C) => b.value = null),
                  onDragover: a[2] || (a[2] = ge(() => {
                  }, ["prevent"])),
                  onDrop: ge((C) => M(c.alias), ["prevent"])
                }, [
                  a[14] || (a[14] = e("span", {
                    class: "rg-colchooser__grip",
                    "aria-hidden": "true"
                  }, "⋮⋮", -1)),
                  e("label", null, [
                    e("input", {
                      type: "checkbox",
                      class: "rg-check",
                      checked: !t.prefs.hidden.includes(c.alias),
                      onChange: (C) => o(c.alias)
                    }, null, 40, eo),
                    N(" " + y(c.label), 1)
                  ]),
                  e("span", to, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${c.label} up`,
                      disabled: k === 0,
                      onClick: (C) => m(c.alias, k - 1)
                    }, "↑", 8, so),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${c.label} down`,
                      disabled: k === t.columns.length - 1,
                      onClick: (C) => m(c.alias, k + 1)
                    }, "↓", 8, lo)
                  ])
                ], 42, Xa))), 128))
              ]),
              _: 1
            }),
            a[15] || (a[15] = e("p", { class: "rg-faint rg-colchooser__hint" }, "Drag to reorder. Drag a header's edge to resize it.", -1))
          ]),
          _: 1
        })) : x("", !0),
        e("div", no, [
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.density === "comfortable",
            title: "Comfortable rows",
            onClick: a[4] || (a[4] = (c) => t.prefs.density = "comfortable")
          }, "Comfortable", 8, ao),
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.density === "compact",
            title: "Compact rows",
            onClick: a[5] || (a[5] = (c) => t.prefs.density = "compact")
          }, "Compact", 8, oo)
        ]),
        e("button", {
          type: "button",
          class: "rg-chip-toggle",
          "aria-pressed": t.prefs.freeze,
          title: "Keep the first column visible while scrolling sideways",
          onClick: a[6] || (a[6] = (c) => t.prefs.freeze = !t.prefs.freeze)
        }, " Freeze first column ", 8, ro),
        t.canTotal ? (s(), n("button", {
          key: 1,
          type: "button",
          class: "rg-chip-toggle",
          "aria-pressed": t.prefs.totals,
          title: "Grand totals of the whole report, not just the loaded rows",
          onClick: a[7] || (a[7] = (c) => t.prefs.totals = !t.prefs.totals)
        }, " Σ Totals ", 8, io)) : x("", !0)
      ]),
      e("div", uo, [
        t.summary ? (s(), n("span", {
          key: 0,
          class: "rg-faint rg-num",
          title: `${t.summary.duration_ms} ms`
        }, y(R(je)(t.summary.rows)) + " rows", 9, co)) : x("", !0),
        e("div", go, [
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.paging === "scroll",
            onClick: a[8] || (a[8] = (c) => t.prefs.paging = "scroll")
          }, "Scroll", 8, mo),
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.paging === "pages",
            disabled: t.grouped,
            title: t.grouped ? "Groups load as you open them; pages are for flat reports" : "Numbered pages",
            onClick: a[9] || (a[9] = (c) => t.prefs.paging = "pages")
          }, "Pages", 8, po)
        ]),
        t.canExport ? (s(), n(U, { key: 1 }, [
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--sm",
            disabled: !!t.exporting,
            title: "Every row, as CSV",
            onClick: a[10] || (a[10] = (c) => g("export", "csv"))
          }, [
            E(F, {
              name: t.exporting === "csv" ? "loader" : "upload",
              spin: t.exporting === "csv",
              small: ""
            }, null, 8, ["name", "spin"]),
            a[16] || (a[16] = N(" CSV ", -1))
          ], 8, vo),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--sm",
            disabled: !!t.exporting,
            title: "Every row, as an Excel file",
            onClick: a[11] || (a[11] = (c) => g("export", "xlsx"))
          }, [
            E(F, {
              name: t.exporting === "xlsx" ? "loader" : "upload",
              spin: t.exporting === "xlsx",
              small: ""
            }, null, 8, ["name", "spin"]),
            a[17] || (a[17] = N(" Excel ", -1))
          ], 8, fo)
        ], 64)) : x("", !0)
      ])
    ]));
  }
}, ho = {
  key: 0,
  class: "rg-gridbox__error",
  role: "alert"
}, yo = ["aria-rowcount", "aria-busy"], $o = ["aria-sort"], _o = ["title", "onClick"], ko = {
  key: 0,
  class: "rg-sort",
  "aria-hidden": "true"
}, wo = ["aria-label", "onMousedown", "onDblclick"], xo = {
  key: 0,
  class: "rg-grid__more"
}, Co = ["colspan"], So = ["onClick"], Mo = ["onMousedown", "onMouseenter"], To = {
  key: 0,
  class: "rg-tree"
}, Eo = ["aria-expanded", "aria-label", "onClick"], Oo = {
  key: 1,
  style: { width: "20px", display: "inline-block" }
}, Ro = { key: 1 }, Do = ["colspan"], Ao = { key: 0 }, Lo = { class: "rg-grid__totals" }, No = { key: 0 }, Vo = {
  key: 1,
  class: "rg-muted",
  style: { padding: "10px 16px" }
}, Po = { class: "rg-gridfoot" }, Fo = {
  key: "stats",
  class: "rg-gridfoot__stats",
  "aria-live": "polite"
}, qo = { key: 0 }, Io = { class: "rg-num" }, Uo = { key: 1 }, jo = { class: "rg-num" }, zo = { key: 2 }, Bo = { class: "rg-num" }, Go = { key: 3 }, Ko = { class: "rg-num" }, Ho = { class: "rg-num" }, Wo = {
  key: "rows",
  class: "rg-gridfoot__stats rg-faint"
}, Yo = { key: 0 }, Jo = { key: 1 }, Zo = ["title"], Qo = {
  key: 3,
  class: "rg-gridfoot__hint"
}, Xo = {
  key: 0,
  class: "rg-pager",
  "aria-label": "Pages"
}, er = { class: "rg-pager__size" }, tr = ["value"], sr = ["disabled"], lr = ["disabled"], nr = { class: "rg-num" }, ar = ["max", "value"], or = ["disabled"], rr = ["disabled"], Ot = {
  __name: "ResultGrid",
  setup(t, { expose: u }) {
    const l = ye(Ee), g = $e(/* @__PURE__ */ new Map()), d = $e(/* @__PURE__ */ new Set()), b = K([]), f = K(null), o = K(null);
    let m = 0, M = null;
    const i = { hidden: [], order: [], widths: {}, density: "comfortable", freeze: !0, totals: !0, paging: "scroll", pageSize: 100 }, r = $e({ ...i }), a = G(() => {
      var I;
      const P = typeof l.gridKey == "object" ? (I = l.gridKey) == null ? void 0 : I.value : l.gridKey;
      return P ? `rg-grid:${P}` : null;
    });
    function c() {
      if (Object.assign(r, { ...i, hidden: [], order: [], widths: {} }), !!a.value)
        try {
          const P = JSON.parse(window.localStorage.getItem(a.value) ?? "null");
          P && typeof P == "object" && Object.assign(r, P);
        } catch {
        }
    }
    function k() {
      if (a.value)
        try {
          window.localStorage.setItem(a.value, JSON.stringify(r));
        } catch {
        }
    }
    he(r, k, { deep: !0 }), he(a, c, { immediate: !0 });
    const C = G(() => l.state.draft), h = G(() => l.grouped.value), p = G(() => C.value.rows.map((P) => P.as)), v = G(() => Object.fromEntries([...C.value.rows, ...C.value.values].map((P) => [P.as, P]))), w = (P) => JSON.stringify(P);
    function O(P) {
      const I = v.value[P.alias];
      return { ...P, grain: (I == null ? void 0 : I.kind) === "dimension" ? I.grain : null };
    }
    const _ = G(() => {
      let P = b.value.filter((Z) => Z.alias !== "__subtotal").map(O);
      if (h.value) {
        const Z = new Set(p.value);
        P = P.filter((te) => !Z.has(te.alias));
      }
      const I = r.order;
      return [...P].sort((Z, te) => {
        const oe = I.indexOf(Z.alias), _e = I.indexOf(te.alias);
        return (oe === -1 ? 1e6 : oe) - (_e === -1 ? 1e6 : _e);
      });
    }), S = G(() => {
      const P = _.value.filter((Z) => !r.hidden.includes(Z.alias));
      return h.value ? [{
        alias: "__tree",
        label: C.value.rows.map((Z) => Z.label).join(" › "),
        kind: "dimension",
        type: "string",
        sortAlias: p.value[0]
      }, ...P] : P;
    });
    function $(P) {
      const I = r.widths[P.alias];
      return I ? { width: `${I}px`, minWidth: `${I}px`, maxWidth: `${I}px` } : null;
    }
    const X = G(() => r.paging === "pages" && !h.value), W = K(1), pe = G(() => {
      const P = [], I = (Z, te) => {
        const oe = g.get(w(Z));
        oe && (oe.rows.forEach((_e, De) => {
          const Ce = h.value ? [...Z, _e[p.value[te]]] : null, ee = h.value ? w(Ce) : `${w(Z)}#${De}`;
          P.push({ row: _e, level: te, keys: Ce, key: ee }), h.value && d.has(ee) && I(Ce, te + 1);
        }), oe.hasMore && Z.length > 0 && P.push({ more: !0, keys: Z, level: te, key: `${w(Z)}#more` }));
      };
      return I([], 0), P;
    }), z = G(() => pe.value.filter((P) => !P.more)), B = G(() => g.get(w([])));
    async function q(P, I = !1) {
      const Z = w(P);
      g.has(Z) || g.set(Z, { rows: [], hasMore: !1, loading: !1 });
      const te = g.get(Z);
      if (te.loading) return;
      te.loading = !0;
      const oe = m;
      try {
        const _e = X.value && P.length === 0 ? r.pageSize : void 0, De = X.value && P.length === 0 ? (W.value - 1) * r.pageSize : I ? te.rows.length : 0, Ce = await l.fetchRows({ keys: P, offset: De, top: P.length === 0, size: _e, fresh: X.value && P.length === 0 && !I });
        if (oe !== m) return;
        P.length === 0 && !I && (b.value = Ce.columns), te.rows = I ? [...te.rows, ...Ce.rows] : Ce.rows, te.hasMore = Ce.page.has_more;
      } catch {
        oe === m && !I && P.length === 0 && (te.rows = []);
      } finally {
        te.loading = !1;
      }
    }
    const L = K(null), D = K(!1), A = K(null);
    async function T() {
      if (L.value = null, A.value = null, !l.fetchSummary || !(r.totals || X.value)) return;
      const P = m;
      D.value = !0;
      try {
        const I = await l.fetchSummary();
        P === m && (L.value = I);
      } catch (I) {
        P === m && (A.value = (I == null ? void 0 : I.message) ?? "Totals are not available.");
      } finally {
        P === m && (D.value = !1);
      }
    }
    const V = G(() => L.value ? Math.max(1, Math.ceil(L.value.rows / r.pageSize)) : null), re = G(() => r.totals && L.value && Object.keys(L.value.totals ?? {}).length ? L.value.totals : null);
    function ie({ keepPage: P = !1 } = {}) {
      m++, g.clear(), d.clear(), Y(), P || (W.value = 1), l.runnable.value ? (q([]), P || T()) : (b.value = [], L.value = null), qt(() => {
        var I, Z;
        return (Z = (I = f.value) == null ? void 0 : I.scrollTo) == null ? void 0 : Z.call(I, { top: 0 });
      });
    }
    he(() => l.state.runSeq, () => ie()), he(() => [r.paging, r.pageSize], () => ie()), he(() => r.totals, (P) => P && !L.value && T());
    function fe(P) {
      var te;
      const I = V.value ?? ((te = B.value) != null && te.hasMore ? W.value + 1 : W.value), Z = Math.min(Math.max(1, P), I);
      Z !== W.value && (W.value = Z, ie({ keepPage: !0 }));
    }
    function Je(P) {
      if (d.has(P.key)) {
        d.delete(P.key);
        return;
      }
      d.add(P.key), g.has(P.key) || q(P.keys);
    }
    function Te(P) {
      return h.value && P.level < p.value.length - 1;
    }
    function xe(P, I) {
      const Z = Number(P.__subtotal ?? 0);
      if (!Z) return null;
      const te = b.value.filter((_e) => _e.kind === "dimension").map((_e) => _e.alias), oe = te.indexOf(I);
      return oe === -1 || oe < te.length - Z ? null : oe === te.length - Z ? Z === te.length ? "Grand total" : "Total" : "";
    }
    function Ze(P, I) {
      return I.alias === "__tree" ? p.value[P.level] : I.alias;
    }
    function Qe(P, I) {
      return P.row[Ze(P, I)];
    }
    function Xe(P, I) {
      if (I.alias === "__tree") {
        const te = p.value[P.level];
        return ke(P.row[te], O({ ...b.value.find((oe) => oe.alias === te) ?? { type: "string", kind: "dimension" }, alias: te }));
      }
      const Z = xe(P.row, I.alias);
      return Z !== null ? Z : ke(P.row[I.alias], I);
    }
    function ut(P, I) {
      const Z = Ze(P, I), te = P.row[Z];
      return te == null && xe(P.row, Z) === null;
    }
    function ht(P, I) {
      const Z = Qe(P, I);
      return We(I) && typeof Z == "number" && Z < 0;
    }
    function Be(P) {
      var Z;
      const I = P.sortAlias ?? P.alias;
      return ((Z = C.value.sort.find((te) => te.field === I)) == null ? void 0 : Z.dir) ?? null;
    }
    function dt(P) {
      if (P.alias === "__tree" || !re.value) return "";
      const I = re.value[P.alias];
      return I == null ? "" : ke(I, P);
    }
    const j = $e({ anchor: null, focus: null, dragging: !1 });
    function Y() {
      j.anchor = j.focus = null, j.dragging = !1;
    }
    const Q = G(() => !j.anchor || !j.focus ? null : {
      r1: Math.min(j.anchor.r, j.focus.r),
      r2: Math.max(j.anchor.r, j.focus.r),
      c1: Math.min(j.anchor.c, j.focus.c),
      c2: Math.max(j.anchor.c, j.focus.c)
    }), J = G(() => new Map(z.value.map((P, I) => [P.key, I])));
    function le(P, I) {
      const Z = J.value.get(P.key), te = Q.value;
      return !!te && Z >= te.r1 && Z <= te.r2 && I >= te.c1 && I <= te.c2;
    }
    function ue(P, I) {
      return j.focus && J.value.get(P.key) === j.focus.r && j.focus.c === I;
    }
    function be(P, I, Z) {
      var oe;
      if (P.button !== 0 || P.target.closest("button")) return;
      const te = { r: J.value.get(I.key), c: Z };
      P.shiftKey && j.anchor || (j.anchor = te), j.focus = te, j.dragging = !0, (oe = f.value) == null || oe.focus({ preventScroll: !0 });
    }
    function me(P, I) {
      j.dragging && (j.focus = { r: J.value.get(P.key), c: I });
    }
    function Fe() {
      j.dragging = !1;
    }
    function ve() {
      const P = Q.value;
      if (!P) return [];
      const I = S.value.slice(P.c1, P.c2 + 1);
      return z.value.slice(P.r1, P.r2 + 1).map((Z) => I.map((te) => ({
        column: te,
        value: Qe(Z, te),
        text: ut(Z, te) ? "" : Xe(Z, te)
      })));
    }
    const Oe = G(() => {
      const P = ve().flat();
      if (P.length < 2) return null;
      const I = P.filter((oe) => oe.value !== null && oe.value !== void 0 && oe.value !== ""), Z = P.filter((oe) => We(oe.column) && typeof oe.value == "number").map((oe) => oe.value), te = { cells: P.length, count: I.length, numbers: Z.length };
      if (Z.length) {
        const oe = Z.reduce((_e, De) => _e + De, 0);
        Object.assign(te, { sum: oe, avg: oe / Z.length, min: Math.min(...Z), max: Math.max(...Z) });
      }
      return te;
    });
    async function et() {
      var Z;
      const P = ve();
      if (!P.length) return;
      const I = P.map((te) => te.map((oe) => typeof oe.value == "number" ? String(oe.value) : oe.text.replace(/[\t\n]/g, " ")).join("	")).join(`
`);
      try {
        await ((Z = navigator.clipboard) == null ? void 0 : Z.writeText(I)), Ge.value = !0, setTimeout(() => Ge.value = !1, 1200);
      } catch {
      }
    }
    const Ge = K(!1);
    function yt(P) {
      const I = P.ctrlKey || P.metaKey;
      if (I && P.key.toLowerCase() === "c" && Q.value) {
        P.preventDefault(), et();
        return;
      }
      if (I && P.key.toLowerCase() === "a" && z.value.length) {
        P.preventDefault(), j.anchor = { r: 0, c: 0 }, j.focus = { r: z.value.length - 1, c: S.value.length - 1 };
        return;
      }
      if (P.key === "Escape") {
        Y();
        return;
      }
      const te = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[P.key];
      if (!te || !j.focus) return;
      P.preventDefault();
      const oe = getComputedStyle(f.value).direction === "rtl" && te[1] !== 0, _e = {
        r: Math.min(Math.max(0, j.focus.r + te[0]), z.value.length - 1),
        c: Math.min(Math.max(0, j.focus.c + (oe ? -te[1] : te[1])), S.value.length - 1)
      };
      j.focus = _e, P.shiftKey || (j.anchor = _e), qt(() => {
        var De, Ce, ee;
        return (ee = (Ce = (De = f.value) == null ? void 0 : De.querySelector(".rg-cell--focus")) == null ? void 0 : Ce.scrollIntoView) == null ? void 0 : ee.call(Ce, { block: "nearest", inline: "nearest" });
      });
    }
    let Ke = null;
    function fs(P, I) {
      const Z = P.target.closest("th");
      Ke = { alias: I.alias, x: P.clientX, width: Z.getBoundingClientRect().width, rtl: getComputedStyle(Z).direction === "rtl" }, document.addEventListener("mousemove", Lt), document.addEventListener("mouseup", Nt, { once: !0 }), P.preventDefault();
    }
    function Lt(P) {
      if (!Ke) return;
      const I = (P.clientX - Ke.x) * (Ke.rtl ? -1 : 1);
      r.widths = { ...r.widths, [Ke.alias]: Math.round(Math.max(60, Math.min(800, Ke.width + I))) };
    }
    function Nt() {
      Ke = null, document.removeEventListener("mousemove", Lt);
    }
    function Vt(P) {
      const { [P.alias]: I, ...Z } = r.widths;
      r.widths = Z;
    }
    const ct = K(null), gt = K(null);
    async function bs(P) {
      if (!(!l.exportReport || ct.value)) {
        ct.value = P, gt.value = null;
        try {
          await l.exportReport(P);
        } catch (I) {
          gt.value = (I == null ? void 0 : I.message) ?? "Export failed.";
        } finally {
          ct.value = null;
        }
      }
    }
    Se(() => {
      typeof IntersectionObserver < "u" && (M = new IntersectionObserver((P) => {
        var I;
        X.value || P.some((Z) => Z.isIntersecting) && ((I = B.value) != null && I.hasMore) && !B.value.loading && q([], !0);
      }, { root: f.value, rootMargin: "200px" }), o.value && M.observe(o.value)), document.addEventListener("mouseup", Fe), l.runnable.value && l.state.runSeq > 0 && ie();
    }), Ne(() => {
      M == null || M.disconnect(), document.removeEventListener("mouseup", Fe), Nt();
    }), u({ loadMore: () => q([], !0), summary: L, prefs: r, stats: Oe, copySelection: et, goTo: fe, page: W });
    const mt = (P) => as(P, null);
    return (P, I) => {
      var Z, te, oe, _e, De, Ce;
      return s(), n("div", {
        class: ne(["rg-gridbox", [`rg-gridbox--${r.density}`, { "rg-gridbox--frozen": r.freeze }]])
      }, [
        E(bo, {
          columns: _.value,
          prefs: r,
          grouped: h.value,
          "can-export": !!R(l).exportReport && S.value.length > 0,
          "can-total": !!R(l).fetchSummary,
          exporting: ct.value,
          summary: L.value,
          "summary-loading": D.value,
          onExport: bs,
          onAutosize: I[0] || (I[0] = (ee) => Vt(ee))
        }, null, 8, ["columns", "prefs", "grouped", "can-export", "can-total", "exporting", "summary", "summary-loading"]),
        gt.value ? (s(), n("p", ho, [
          E(F, {
            name: "alert",
            small: ""
          }),
          N(" " + y(gt.value), 1)
        ])) : x("", !0),
        e("div", {
          ref_key: "wrap",
          ref: f,
          class: "rg-grid-wrap",
          tabindex: "0",
          role: "grid",
          "aria-rowcount": ((Z = L.value) == null ? void 0 : Z.rows) ?? void 0,
          "aria-busy": R(l).state.running ? "true" : "false",
          onKeydown: yt
        }, [
          S.value.length ? (s(), n("table", {
            key: 0,
            class: ne(["rg-grid", { "rg-grid--selecting": j.dragging }])
          }, [
            e("thead", null, [
              e("tr", null, [
                (s(!0), n(U, null, H(S.value, (ee) => (s(), n("th", {
                  key: ee.alias,
                  scope: "col",
                  class: ne({ "rg-num": R(We)(ee) }),
                  style: Me($(ee)),
                  "aria-sort": Be(ee) === "asc" ? "ascending" : Be(ee) === "desc" ? "descending" : "none"
                }, [
                  e("button", {
                    type: "button",
                    title: `Sort by ${ee.label}`,
                    onClick: (we) => R(l).toggleSort(ee.sortAlias ?? ee.alias)
                  }, [
                    N(y(ee.label) + " ", 1),
                    Be(ee) ? (s(), n("span", ko, y(Be(ee) === "asc" ? "↑" : "↓"), 1)) : x("", !0)
                  ], 8, _o),
                  e("span", {
                    class: "rg-resize",
                    role: "separator",
                    "aria-orientation": "vertical",
                    "aria-label": `Resize ${ee.label}`,
                    title: "Drag to resize, double-click to fit",
                    onMousedown: (we) => fs(we, ee),
                    onDblclick: (we) => Vt(ee)
                  }, null, 40, wo)
                ], 14, $o))), 128))
              ])
            ]),
            e("tbody", null, [
              (te = B.value) != null && te.loading && !B.value.rows.length ? (s(), n(U, { key: 0 }, H(8, (ee) => e("tr", {
                key: `sk${ee}`,
                class: "rg-row--skeleton"
              }, [
                (s(!0), n(U, null, H(S.value, (we) => (s(), n("td", {
                  key: we.alias
                }, [
                  e("span", {
                    class: "rg-skeleton",
                    style: Me({ width: `${40 + (ee * 23 + we.alias.length * 7) % 50}%` })
                  }, null, 4)
                ]))), 128))
              ])), 64)) : x("", !0),
              (s(!0), n(U, null, H(pe.value, (ee) => (s(), n(U, {
                key: ee.key
              }, [
                ee.more ? (s(), n("tr", xo, [
                  e("td", {
                    colspan: S.value.length
                  }, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--sm rg-btn--ghost",
                      onClick: (we) => q(ee.keys, !0)
                    }, "Show more", 8, So)
                  ], 8, Co)
                ])) : (s(), n("tr", {
                  key: 1,
                  class: ne(["rg-row", { "rg-row--group": Te(ee), "rg-row--subtotal": Number(ee.row.__subtotal) > 0 }])
                }, [
                  (s(!0), n(U, null, H(S.value, (we, tt) => {
                    var Pt, Ft;
                    return s(), n("td", {
                      key: we.alias,
                      class: ne({
                        "rg-num": R(We)(we),
                        "rg-cell--empty": ut(ee, we),
                        "rg-cell--negative": ht(ee, we),
                        "rg-cell--selected": le(ee, tt),
                        "rg-cell--focus": ue(ee, tt)
                      }),
                      style: Me([$(we), tt === 0 && h.value ? { paddingInlineStart: `${12 + ee.level * 20}px` } : null]),
                      onMousedown: ($t) => be($t, ee, tt),
                      onMouseenter: ($t) => me(ee, tt)
                    }, [
                      tt === 0 && h.value ? (s(), n("span", To, [
                        Te(ee) ? (s(), n("button", {
                          key: 0,
                          type: "button",
                          class: "rg-tree__toggle",
                          "aria-expanded": d.has(ee.key) ? "true" : "false",
                          "aria-label": `${d.has(ee.key) ? "Collapse" : "Expand"} ${Xe(ee, we)}`,
                          onClick: ($t) => Je(ee)
                        }, [
                          E(F, {
                            name: (Pt = g.get(ee.key)) != null && Pt.loading ? "loader" : "chevron",
                            small: "",
                            spin: !!((Ft = g.get(ee.key)) != null && Ft.loading)
                          }, null, 8, ["name", "spin"])
                        ], 8, Eo)) : (s(), n("span", Oo)),
                        N(" " + y(Xe(ee, we)), 1)
                      ])) : (s(), n(U, { key: 1 }, [
                        N(y(Xe(ee, we)), 1)
                      ], 64))
                    ], 46, Mo);
                  }), 128))
                ], 2))
              ], 64))), 128)),
              B.value && !B.value.rows.length && !B.value.loading && !R(l).state.error ? (s(), n("tr", Ro, [
                e("td", {
                  colspan: S.value.length,
                  class: "rg-muted",
                  style: { "text-align": "center", height: "80px" }
                }, "No rows match these filters.", 8, Do)
              ])) : x("", !0)
            ]),
            re.value && ((oe = B.value) != null && oe.rows.length) ? (s(), n("tfoot", Ao, [
              e("tr", Lo, [
                (s(!0), n(U, null, H(S.value, (ee, we) => (s(), n("td", {
                  key: ee.alias,
                  class: ne({ "rg-num": R(We)(ee) }),
                  style: Me($(ee))
                }, [
                  we === 0 && !dt(ee) ? (s(), n("b", No, "Grand total")) : (s(), n(U, { key: 1 }, [
                    N(y(dt(ee)), 1)
                  ], 64))
                ], 6))), 128))
              ])
            ])) : x("", !0)
          ], 2)) : x("", !0),
          e("div", {
            ref_key: "sentinel",
            ref: o,
            class: "rg-sentinel"
          }, null, 512),
          !X.value && ((_e = B.value) != null && _e.hasMore) && ((De = B.value) != null && De.loading) && B.value.rows.length ? (s(), n("div", Vo, "Loading more…")) : x("", !0)
        ], 40, yo),
        e("footer", Po, [
          E(it, {
            name: "rg-swap",
            mode: "out-in"
          }, {
            default: de(() => [
              Oe.value ? (s(), n("div", Fo, [
                Oe.value.numbers ? (s(), n("span", qo, [
                  I[7] || (I[7] = N("Sum ", -1)),
                  e("b", Io, y(mt(Oe.value.sum)), 1)
                ])) : x("", !0),
                Oe.value.numbers ? (s(), n("span", Uo, [
                  I[8] || (I[8] = N("Average ", -1)),
                  e("b", jo, y(mt(Oe.value.avg)), 1)
                ])) : x("", !0),
                Oe.value.numbers ? (s(), n("span", zo, [
                  I[9] || (I[9] = N("Min ", -1)),
                  e("b", Bo, y(mt(Oe.value.min)), 1)
                ])) : x("", !0),
                Oe.value.numbers ? (s(), n("span", Go, [
                  I[10] || (I[10] = N("Max ", -1)),
                  e("b", Ko, y(mt(Oe.value.max)), 1)
                ])) : x("", !0),
                e("span", null, [
                  I[11] || (I[11] = N("Count ", -1)),
                  e("b", Ho, y(R(je)(Oe.value.count)), 1)
                ]),
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--ghost",
                  title: "Copy (Ctrl+C)",
                  onClick: et
                }, [
                  E(F, {
                    name: Ge.value ? "check" : "copy",
                    small: ""
                  }, null, 8, ["name"]),
                  N(" " + y(Ge.value ? "Copied" : "Copy"), 1)
                ])
              ])) : (s(), n("div", Wo, [
                L.value ? (s(), n("span", Yo, y(R(je)(L.value.rows)) + " " + y(L.value.rows === 1 ? "row" : "rows"), 1)) : D.value ? (s(), n("span", Jo, [
                  E(F, {
                    name: "loader",
                    spin: "",
                    small: ""
                  }),
                  I[12] || (I[12] = N(" Counting…", -1))
                ])) : A.value ? (s(), n("span", {
                  key: 2,
                  title: A.value
                }, "Total rows unavailable", 8, Zo)) : x("", !0),
                z.value.length ? (s(), n("span", Qo, "Click and drag to select cells")) : x("", !0)
              ]))
            ]),
            _: 1
          }),
          X.value ? (s(), n("nav", Xo, [
            e("label", er, [
              I[13] || (I[13] = N(" Rows per page ", -1)),
              se(e("select", {
                "onUpdate:modelValue": I[1] || (I[1] = (ee) => r.pageSize = ee),
                class: "rg-input"
              }, [
                (s(), n(U, null, H([50, 100, 200, 500, 1e3], (ee) => e("option", {
                  key: ee,
                  value: ee
                }, y(ee), 9, tr)), 64))
              ], 512), [
                [
                  Pe,
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
              disabled: W.value === 1,
              onClick: I[2] || (I[2] = (ee) => fe(1))
            }, "«", 8, sr),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Previous page",
              disabled: W.value === 1,
              onClick: I[3] || (I[3] = (ee) => fe(W.value - 1))
            }, "‹", 8, lr),
            e("span", nr, [
              I[14] || (I[14] = N("Page ", -1)),
              e("input", {
                class: "rg-input rg-pager__input",
                type: "number",
                min: "1",
                max: V.value ?? void 0,
                value: W.value,
                "aria-label": "Page",
                onChange: I[4] || (I[4] = (ee) => fe(Number(ee.target.value)))
              }, null, 40, ar),
              V.value ? (s(), n(U, { key: 0 }, [
                N(" of " + y(R(je)(V.value)), 1)
              ], 64)) : x("", !0)
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Next page",
              disabled: V.value ? W.value >= V.value : !((Ce = B.value) != null && Ce.hasMore),
              onClick: I[5] || (I[5] = (ee) => fe(W.value + 1))
            }, "›", 8, or),
            V.value ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Last page",
              disabled: W.value >= V.value,
              onClick: I[6] || (I[6] = (ee) => fe(V.value))
            }, "»", 8, rr)) : x("", !0)
          ])) : x("", !0)
        ])
      ], 2);
    };
  }
}, ir = {
  class: "rg-results",
  "aria-label": "Results"
}, ur = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, dr = { class: "rg-num" }, cr = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, gr = {
  key: 1,
  class: "rg-num",
  title: "How many rows the database expects to read"
}, mr = {
  key: 2,
  class: "rg-badge rg-badge--warning",
  title: "Large enough that exporting it will run in the background"
}, pr = {
  key: 2,
  class: "rg-faint"
}, vr = ["aria-expanded"], fr = {
  key: 0,
  class: "rg-mono",
  style: { margin: "0", padding: "10px 16px", "max-height": "160px", overflow: "auto", background: "var(--rg-sunken)", "white-space": "pre-wrap", "font-size": "11.5px" }
}, br = {
  key: 1,
  class: "rg-errorbox",
  role: "alert"
}, hr = { class: "rg-errorbox__title" }, yr = {
  key: 0,
  class: "rg-errorbox__options"
}, $r = ["onClick"], _r = {
  key: 0,
  class: "rg-badge rg-badge--warning"
}, kr = {
  __name: "ResultsPanel",
  setup(t) {
    const u = ye(Ee), l = K(!1), g = G(() => u.state.meta), d = G(() => u.state.error), b = {
      detail: "Rows",
      aggregate: "Totals",
      multi_fact: "Totals per branch, combined (no double counting)"
    }, f = {
      AMBIGUOUS_PATH: "Choose how to connect the tables",
      FAN_TRAP: "These fields cannot be totalled together",
      TIMEOUT: "The report took too long",
      TOO_HEAVY: "The report would read too much data",
      DATASET_FORBIDDEN: "No access",
      NO_TOPICS: "No topics yet",
      TOO_MANY_QUERIES: "Too many reports running",
      SERVER_BUSY: "The report server is busy"
    };
    return (o, m) => {
      var M, i, r;
      return s(), n("section", ir, [
        e("div", ur, [
          R(u).state.running ? (s(), n(U, { key: 0 }, [
            e("span", null, [
              E(F, {
                name: "loader",
                spin: "",
                small: ""
              }),
              m[2] || (m[2] = N(" Running…", -1))
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              onClick: m[0] || (m[0] = (a) => {
                R(u).cancelRunning(), R(u).state.running = !1;
              })
            }, [
              E(F, {
                name: "stop",
                small: ""
              }),
              m[3] || (m[3] = N(" Stop ", -1))
            ])
          ], 64)) : g.value && !d.value ? (s(), n(U, { key: 1 }, [
            e("span", null, y(b[g.value.mode] ?? g.value.mode), 1),
            e("span", dr, y(g.value.duration_ms) + " ms", 1),
            g.value.cached ? (s(), n("span", cr, "from cache")) : x("", !0),
            g.value.estimated_rows !== void 0 ? (s(), n("span", gr, " reads ~" + y(R(je)(g.value.estimated_rows)) + " rows ", 1)) : x("", !0),
            g.value.heavy ? (s(), n("span", mr, "heavy")) : x("", !0)
          ], 64)) : R(u).runnable.value ? x("", !0) : (s(), n("span", pr, "Add fields to see results.")),
          m[4] || (m[4] = e("span", { class: "rg-spacer" }, null, -1)),
          (M = g.value) != null && M.sql ? (s(), n("button", {
            key: 3,
            type: "button",
            class: "rg-btn rg-btn--sm rg-btn--ghost",
            "aria-expanded": l.value,
            onClick: m[1] || (m[1] = (a) => l.value = !l.value)
          }, y(l.value ? "Hide SQL" : "SQL"), 9, vr)) : x("", !0)
        ]),
        e("div", null, [
          l.value && ((i = g.value) != null && i.sql) ? (s(), n("pre", fr, y(g.value.sql), 1)) : x("", !0),
          d.value ? (s(), n("div", br, [
            e("span", hr, [
              E(F, {
                name: "alert",
                small: ""
              }),
              N(y(f[d.value.code] ?? "This report cannot run yet"), 1)
            ]),
            e("span", null, y(d.value.message), 1),
            d.value.code === "AMBIGUOUS_PATH" && R(u).state.errorUid ? (s(), n("div", yr, [
              (s(!0), n(U, null, H(((r = d.value.details) == null ? void 0 : r.options) ?? [], (a) => (s(), n("button", {
                key: a.path.join("."),
                type: "button",
                class: "rg-btn",
                onClick: (c) => R(u).applyPath(R(u).state.errorUid, a.path)
              }, [
                N(y(a.description) + " ", 1),
                a.multiplies_rows ? (s(), n("span", _r, "several per row")) : x("", !0)
              ], 8, $r))), 128))
            ])) : x("", !0)
          ])) : x("", !0)
        ]),
        E(Ot)
      ]);
    };
  }
}, wr = ["aria-label"], xr = { class: "rg-dialog__head" }, Cr = { class: "rg-dialog__body" }, Sr = { class: "rg-dialog__foot" }, ze = {
  __name: "RgDialog",
  props: { title: { type: String, required: !0 } },
  emits: ["close"],
  setup(t, { emit: u }) {
    const l = u, g = K(null);
    function d(b) {
      b.key === "Escape" && l("close");
    }
    return Se(() => {
      var b, f;
      document.addEventListener("keydown", d), (f = (b = g.value) == null ? void 0 : b.querySelector("textarea, input, button")) == null || f.focus();
    }), Ne(() => document.removeEventListener("keydown", d)), (b, f) => (s(), ae(Zt, { to: "body" }, [
      e("div", Qt({ class: "rg-root rg-overlay" }, b.$attrs, {
        onMousedown: f[0] || (f[0] = ge((o) => l("close"), ["self"]))
      }), [
        e("div", {
          ref_key: "dialog",
          ref: g,
          class: "rg-dialog",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": t.title
        }, [
          e("div", xr, [
            e("h2", null, y(t.title), 1)
          ]),
          e("div", Cr, [
            rt(b.$slots, "default")
          ]),
          e("div", Sr, [
            rt(b.$slots, "footer")
          ])
        ], 8, wr)
      ], 16)
    ]));
  }
}, Mr = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-formula-label"
}, Tr = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-formula-text"
}, Er = ["onKeydown"], Or = { class: "rg-token-list" }, Rr = ["title", "onClick"], Dr = {
  key: 0,
  class: "rg-faint",
  style: { "font-size": "12px" }
}, Ar = { class: "rg-token-list" }, Lr = ["onClick"], Nr = ["disabled"], Vr = ["disabled"], Pr = {
  __name: "FormulaDialog",
  props: { item: { type: Object, default: null } },
  emits: ["close"],
  setup(t, { emit: u }) {
    var p, v;
    const l = t, g = u, d = ye(Ee), b = ye("rg-theme", "light"), { api: f } = Le(), o = K(((p = l.item) == null ? void 0 : p.label) ?? ""), m = K(((v = l.item) == null ? void 0 : v.formula) ?? ""), M = K(null), i = K(null), r = K(!1), a = G(() => [...d.state.draft.rows, ...d.state.draft.values].filter((w) => {
      var O;
      return w.uid !== ((O = l.item) == null ? void 0 : O.uid);
    })), c = [
      ["IF(condition, then, else)", "IF(, , )"],
      ["SAFE_DIVIDE(a, b)", "SAFE_DIVIDE(, )"],
      ["ROUND(x, 2)", "ROUND(, 2)"],
      ["COALESCE(a, 0)", "COALESCE(, 0)"],
      ["ABS(x)", "ABS()"],
      ["GREATEST(a, b)", "GREATEST(, )"],
      ["LEAST(a, b)", "LEAST(, )"],
      ["CONCAT(a, b)", "CONCAT(, )"]
    ];
    function k(w) {
      const O = M.value, _ = (O == null ? void 0 : O.selectionStart) ?? m.value.length, S = (O == null ? void 0 : O.selectionEnd) ?? m.value.length;
      m.value = m.value.slice(0, _) + w + m.value.slice(S), requestAnimationFrame(() => {
        O == null || O.focus();
        const $ = _ + (w.includes("(") ? w.indexOf("(") + 1 : w.length);
        O == null || O.setSelectionRange($, $);
      }), i.value = null;
    }
    async function C() {
      r.value = !0;
      try {
        const w = JSON.parse(JSON.stringify(d.state.draft)), O = { uid: "__probe", kind: "formula", label: o.value || "Formula", formula: m.value, as: "__formula_check", format: null };
        return l.item ? w.values = w.values.map((_) => _.uid === l.item.uid ? { ...O, as: _.as } : _) : w.values.push(O), await f.query.validate(ns(w).definition), i.value = { ok: !0, message: "The formula is valid." }, !0;
      } catch (w) {
        return i.value = { ok: !1, message: w.message }, !1;
      } finally {
        r.value = !1;
      }
    }
    async function h() {
      !o.value.trim() || !m.value.trim() || await C() && (l.item ? d.updateFormula(l.item.uid, o.value.trim(), m.value.trim()) : d.addFormula(o.value.trim(), m.value.trim()), g("close"));
    }
    return (w, O) => (s(), ae(ze, {
      title: t.item ? "Edit formula" : "New formula",
      "data-rg-theme": R(b),
      class: "rg-dialog--wide",
      onClose: O[4] || (O[4] = (_) => g("close"))
    }, {
      footer: de(() => [
        e("button", {
          type: "button",
          class: "rg-btn",
          disabled: r.value || !m.value.trim(),
          onClick: C
        }, "Check", 8, Nr),
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: O[3] || (O[3] = (_) => g("close"))
        }, "Cancel"),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          disabled: r.value || !o.value.trim() || !m.value.trim(),
          onClick: h
        }, y(t.item ? "Save formula" : "Add formula"), 9, Vr)
      ]),
      default: de(() => [
        e("label", Mr, [
          O[5] || (O[5] = N(" Column name ", -1)),
          se(e("input", {
            id: "rg-formula-label",
            "onUpdate:modelValue": O[0] || (O[0] = (_) => o.value = _),
            class: "rg-input",
            maxlength: "120",
            placeholder: "Visits per doctor"
          }, null, 512), [
            [ce, o.value]
          ])
        ]),
        e("label", Tr, [
          O[6] || (O[6] = N(" Formula ", -1)),
          se(e("textarea", {
            id: "rg-formula-text",
            ref_key: "textarea",
            ref: M,
            "onUpdate:modelValue": O[1] || (O[1] = (_) => m.value = _),
            class: "rg-textarea rg-formula",
            spellcheck: "false",
            placeholder: "visits / doctors",
            onInput: O[2] || (O[2] = (_) => i.value = null),
            onKeydown: [
              Ie(ge(h, ["ctrl", "prevent"]), ["enter"]),
              Ie(ge(h, ["meta", "prevent"]), ["enter"])
            ]
          }, null, 40, Er), [
            [ce, m.value]
          ])
        ]),
        e("div", null, [
          O[7] || (O[7] = e("div", {
            class: "rg-faint",
            style: { "font-size": "11.5px", "margin-bottom": "4px" }
          }, "Fields in this report (click to insert)", -1)),
          e("div", Or, [
            (s(!0), n(U, null, H(a.value, (_) => (s(), n("button", {
              key: _.uid,
              type: "button",
              class: "rg-token",
              title: _.label,
              onClick: (S) => k(_.as)
            }, y(_.as), 9, Rr))), 128)),
            a.value.length ? x("", !0) : (s(), n("span", Dr, "Add fields first; formulas calculate with them."))
          ])
        ]),
        e("div", null, [
          O[8] || (O[8] = e("div", {
            class: "rg-faint",
            style: { "font-size": "11.5px", "margin-bottom": "4px" }
          }, "Functions", -1)),
          e("div", Ar, [
            (s(), n(U, null, H(c, ([_, S]) => e("button", {
              key: _,
              type: "button",
              class: "rg-token",
              onClick: ($) => k(S)
            }, y(_), 9, Lr)), 64))
          ])
        ]),
        O[9] || (O[9] = e("p", {
          class: "rg-faint",
          style: { margin: "0", "font-size": "12px" }
        }, " Use + − × ÷ (+ - * /), comparisons (> = <), AND, OR, NOT, and text in quotes ('High'). Dividing by zero gives an empty value instead of an error. ", -1)),
        i.value ? (s(), n("p", {
          key: 0,
          class: ne(["rg-check-result", i.value.ok ? "rg-check-result--ok" : "rg-check-result--error"]),
          role: "status"
        }, y(i.value.message), 3)) : x("", !0)
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, Fr = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-name"
}, qr = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-description"
}, Ir = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-folder"
}, Ur = { id: "rg-save-folders" }, jr = ["value"], zr = { style: { border: "0", padding: "0", margin: "0", display: "flex", "flex-direction": "column", gap: "6px" } }, Br = {
  class: "rg-field-inline",
  for: "rg-vis-private"
}, Gr = {
  class: "rg-field-inline",
  for: "rg-vis-public"
}, Kr = ["disabled"], os = {
  __name: "SaveDialog",
  props: {
    copy: { type: Boolean, default: !1 },
    folders: { type: Array, default: () => [] }
  },
  emits: ["close", "saved"],
  setup(t, { emit: u }) {
    const l = t, g = u, d = ye(Ee), b = ye("rg-theme", "light"), f = d.state.draft, o = K(l.copy ? `Copy of ${f.name}` : f.name), m = K(f.description), M = K(f.folder), i = K(l.copy ? "private" : f.visibility);
    async function r() {
      try {
        const a = await d.save({ name: o.value, description: m.value, folder: M.value, visibility: i.value, copy: l.copy });
        g("saved", a), g("close");
      } catch {
      }
    }
    return (a, c) => (s(), ae(ze, {
      title: t.copy ? "Save a copy" : R(f).uuid ? "Save report" : "Save new report",
      "data-rg-theme": R(b),
      onClose: c[6] || (c[6] = (k) => g("close"))
    }, {
      footer: de(() => [
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: c[5] || (c[5] = (k) => g("close"))
        }, "Cancel"),
        e("button", {
          type: "submit",
          form: "rg-save-form",
          class: "rg-btn rg-btn--primary",
          disabled: R(d).state.saving || !o.value.trim()
        }, y(R(d).state.saving ? "Saving…" : "Save"), 9, Kr)
      ]),
      default: de(() => [
        e("form", {
          id: "rg-save-form",
          style: { display: "contents" },
          onSubmit: ge(r, ["prevent"])
        }, [
          e("label", Fr, [
            c[7] || (c[7] = N(" Name ", -1)),
            se(e("input", {
              id: "rg-save-name",
              "onUpdate:modelValue": c[0] || (c[0] = (k) => o.value = k),
              class: "rg-input",
              maxlength: "255",
              required: ""
            }, null, 512), [
              [ce, o.value]
            ])
          ]),
          e("label", qr, [
            c[8] || (c[8] = N(" Description (optional) ", -1)),
            se(e("textarea", {
              id: "rg-save-description",
              "onUpdate:modelValue": c[1] || (c[1] = (k) => m.value = k),
              class: "rg-textarea",
              maxlength: "2000"
            }, null, 512), [
              [ce, m.value]
            ])
          ]),
          e("label", Ir, [
            c[9] || (c[9] = N(" Folder (optional) ", -1)),
            se(e("input", {
              id: "rg-save-folder",
              "onUpdate:modelValue": c[2] || (c[2] = (k) => M.value = k),
              class: "rg-input",
              list: "rg-save-folders",
              maxlength: "255",
              placeholder: "Sales"
            }, null, 512), [
              [ce, M.value]
            ]),
            e("datalist", Ur, [
              (s(!0), n(U, null, H(t.folders, (k) => (s(), n("option", {
                key: k,
                value: k
              }, null, 8, jr))), 128))
            ])
          ]),
          e("fieldset", zr, [
            c[12] || (c[12] = e("legend", {
              class: "rg-muted",
              style: { "font-size": "12px", "margin-bottom": "4px" }
            }, "Who can open it", -1)),
            e("label", Br, [
              se(e("input", {
                id: "rg-vis-private",
                "onUpdate:modelValue": c[3] || (c[3] = (k) => i.value = k),
                type: "radio",
                value: "private"
              }, null, 512), [
                [It, i.value]
              ]),
              c[10] || (c[10] = N(" Only me (and people I share it with) ", -1))
            ]),
            e("label", Gr, [
              se(e("input", {
                id: "rg-vis-public",
                "onUpdate:modelValue": c[4] || (c[4] = (k) => i.value = k),
                type: "radio",
                value: "public"
              }, null, 512), [
                [It, i.value]
              ]),
              c[11] || (c[11] = N(" Everyone who builds reports ", -1))
            ]),
            c[13] || (c[13] = e("span", {
              class: "rg-faint",
              style: { "font-size": "11.5px" }
            }, "People who open it only see the rows they are allowed to see.", -1))
          ])
        ], 32)
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, Hr = {
  key: 0,
  class: "rg-skeleton-list"
}, Wr = { class: "rg-muted rg-publish__intro" }, Yr = {
  class: "rg-publish__field",
  for: "rg-publish-permission"
}, Jr = {
  key: 0,
  class: "rg-publish__error"
}, Zr = {
  key: 1,
  class: "rg-faint"
}, Qr = { class: "rg-publish__field" }, Xr = { class: "rg-num rg-faint" }, ei = { class: "rg-search" }, ti = {
  class: "rg-publish__roles",
  role: "group",
  "aria-label": "Roles"
}, si = ["aria-pressed", "onClick"], li = {
  key: 0,
  class: "rg-faint"
}, ni = {
  key: 0,
  class: "rg-publish__error"
}, ai = { class: "rg-publish__menu" }, oi = {
  class: "rg-field-inline",
  for: "rg-publish-menu"
}, ri = {
  key: 0,
  class: "rg-publish__field",
  for: "rg-publish-group"
}, ii = {
  key: 0,
  class: "rg-publish__error",
  role: "alert"
}, ui = ["disabled"], di = ["disabled"], Rt = {
  __name: "PublishDialog",
  props: {
    uuid: { type: String, required: !0 },
    name: { type: String, default: "" },
    /** report | dashboard */
    kind: { type: String, default: "report" }
  },
  emits: ["close", "published", "unpublished"],
  setup(t, { emit: u }) {
    const l = t, g = u, { api: d } = Le(), b = G(() => l.kind === "dashboard" ? d.dashboards : d.reports), f = ye("rg-theme", "light"), o = $e({ loading: !0, saving: !1, error: null, errors: {}, published: !1 }), m = $e({ permission: "", roles: [], inMenu: !0, menuGroup: "" }), M = K([]), i = K(""), r = G(() => {
      const p = i.value.trim().toLowerCase();
      return M.value.filter((v) => !p || v.name.toLowerCase().includes(p));
    });
    Se(async () => {
      try {
        const [p, v] = await Promise.all([b.value.publishing(l.uuid), d.roles()]);
        M.value = v, o.published = p.published, Object.assign(m, {
          permission: p.permission ?? p.suggested_permission,
          roles: p.roles ?? [],
          inMenu: p.published ? p.in_menu : !0,
          menuGroup: p.menu_group ?? ""
        });
      } catch (p) {
        o.error = p.message;
      } finally {
        o.loading = !1;
      }
    });
    function a(p) {
      m.roles = m.roles.includes(p) ? m.roles.filter((v) => v !== p) : [...m.roles, p];
    }
    async function c() {
      o.saving = !0, o.errors = {}, o.error = null;
      try {
        const p = await b.value.publish(l.uuid, {
          permission: m.permission.trim(),
          roles: m.roles,
          inMenu: m.inMenu,
          menuGroup: m.menuGroup.trim() || null
        });
        g("published", p), g("close");
      } catch (p) {
        o.errors = p.errors ?? {}, o.error = Object.keys(o.errors).length ? null : p.message;
      } finally {
        o.saving = !1;
      }
    }
    async function k() {
      o.saving = !0;
      try {
        const p = await b.value.unpublish(l.uuid);
        g("unpublished", p), g("close");
      } catch (p) {
        o.error = p.message;
      } finally {
        o.saving = !1;
      }
    }
    const C = (p) => {
      var v;
      return ((v = o.errors[p]) == null ? void 0 : v[0]) ?? null;
    }, h = G(() => {
      var p, v;
      return ((v = (p = Object.entries(o.errors).find(([w]) => w.startsWith("roles"))) == null ? void 0 : p[1]) == null ? void 0 : v[0]) ?? null;
    });
    return (p, v) => (s(), ae(ze, {
      title: o.published ? `Publishing: ${t.name}` : `Publish “${t.name}”`,
      "data-rg-theme": R(f),
      onClose: v[5] || (v[5] = (w) => g("close"))
    }, {
      footer: de(() => [
        o.published ? (s(), n("button", {
          key: 0,
          type: "button",
          class: "rg-btn rg-btn--danger",
          disabled: o.saving,
          onClick: k
        }, "Unpublish", 8, ui)) : x("", !0),
        v[11] || (v[11] = e("span", { style: { flex: "1" } }, null, -1)),
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: v[4] || (v[4] = (w) => g("close"))
        }, "Cancel"),
        e("button", {
          type: "submit",
          form: "rg-publish-form",
          class: "rg-btn rg-btn--primary",
          disabled: o.loading || o.saving || !m.permission.trim()
        }, y(o.saving ? "Saving…" : o.published ? "Update" : "Publish"), 9, di)
      ]),
      default: de(() => [
        o.loading ? (s(), n("div", Hr, [
          (s(), n(U, null, H(4, (w) => e("div", {
            key: w,
            class: "rg-skeleton"
          })), 64))
        ])) : (s(), n("form", {
          key: 1,
          id: "rg-publish-form",
          class: "rg-publish",
          onSubmit: ge(c, ["prevent"])
        }, [
          e("p", Wr, " Everyone with the permission below can open " + y(t.kind === "dashboard" ? "this dashboard" : "and run this report") + ", each seeing only their own data. Building reports is not needed. ", 1),
          e("label", Yr, [
            v[6] || (v[6] = e("span", null, "Permission", -1)),
            se(e("input", {
              id: "rg-publish-permission",
              "onUpdate:modelValue": v[0] || (v[0] = (w) => m.permission = w),
              class: "rg-input rg-mono",
              maxlength: "191",
              required: "",
              pattern: "[a-z0-9][a-z0-9_.\\-]*"
            }, null, 512), [
              [ce, m.permission]
            ]),
            C("permission") ? (s(), n("small", Jr, y(C("permission")), 1)) : (s(), n("small", Zr, "Created if it does not exist. Lowercase letters, digits, dots, dashes and underscores."))
          ]),
          e("fieldset", Qr, [
            e("legend", null, [
              v[7] || (v[7] = N("Roles that get it ", -1)),
              e("span", Xr, y(m.roles.length) + " selected", 1)
            ]),
            e("label", ei, [
              v[8] || (v[8] = e("span", { class: "rg-sr-only" }, "Search roles", -1)),
              E(F, { name: "search" }),
              se(e("input", {
                "onUpdate:modelValue": v[1] || (v[1] = (w) => i.value = w),
                class: "rg-input",
                type: "search",
                placeholder: "Search roles",
                autocomplete: "off"
              }, null, 512), [
                [ce, i.value]
              ])
            ]),
            e("div", ti, [
              (s(!0), n(U, null, H(r.value, (w) => (s(), n("button", {
                key: w.id,
                type: "button",
                class: "rg-publish__role",
                "aria-pressed": m.roles.includes(w.name),
                onClick: (O) => a(w.name)
              }, [
                E(F, {
                  name: m.roles.includes(w.name) ? "check" : "plus",
                  small: ""
                }, null, 8, ["name"]),
                N(y(w.name), 1)
              ], 8, si))), 128)),
              r.value.length ? x("", !0) : (s(), n("span", li, "No role matches."))
            ]),
            h.value ? (s(), n("small", ni, y(h.value), 1)) : x("", !0)
          ]),
          e("div", ai, [
            e("label", oi, [
              se(e("input", {
                id: "rg-publish-menu",
                "onUpdate:modelValue": v[2] || (v[2] = (w) => m.inMenu = w),
                type: "checkbox",
                class: "rg-check"
              }, null, 512), [
                [ot, m.inMenu]
              ]),
              v[9] || (v[9] = N(" Show in the sidebar ", -1))
            ]),
            m.inMenu ? (s(), n("label", ri, [
              v[10] || (v[10] = e("span", null, "Sidebar group (optional)", -1)),
              se(e("input", {
                id: "rg-publish-group",
                "onUpdate:modelValue": v[3] || (v[3] = (w) => m.menuGroup = w),
                class: "rg-input",
                maxlength: "120",
                placeholder: "Sales"
              }, null, 512), [
                [ce, m.menuGroup]
              ])
            ])) : x("", !0)
          ]),
          o.error ? (s(), n("p", ii, y(o.error), 1)) : x("", !0)
        ], 32))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, ci = 200;
let gi = 0;
const st = () => `c${++gi}`, rs = [
  { key: "line", label: "Line" },
  { key: "division", label: "Division" },
  { key: "employee", label: "Employee" }
];
function Yt(t) {
  const u = String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return /^[a-z]/.test(u) ? u.slice(0, 50) : `c_${u}`.slice(0, 50);
}
function Ct() {
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
      { uid: st(), base: "line", as: "line", label: "Line" },
      { uid: st(), base: "employee", as: "employee", label: "Employee" }
    ],
    // For the results grid: combined reports have no row groups.
    rows: [],
    values: [],
    sort: []
  };
}
function mi(t) {
  var g, d;
  const u = t.definition ?? {}, l = ((g = u.context) == null ? void 0 : g.period) ?? "this_month";
  return {
    ...Ct(),
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
    fields: (u.fields ?? []).map((b) => ({ uid: st(), ...b, label: b.label ?? null })),
    sort: u.sort ?? []
  };
}
function pi(t, u) {
  const l = $e({
    loading: !1,
    draft: Ct(),
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
  }), g = G(() => {
    const z = l.draft, B = z.period === "custom" ? z.from && z.to ? [z.from, z.to] : "this_month" : z.period;
    return {
      type: "combined",
      level: z.level,
      context: { period: B, ...z.lines.length ? { lines: z.lines } : {} },
      fields: z.fields.map(({ uid: q, ...L }) => Object.fromEntries(Object.entries(L).filter(([, D]) => D != null && D !== ""))),
      sort: z.sort.filter((q) => z.fields.some((L) => L.as === q.field))
    };
  }), d = () => JSON.stringify([g.value, l.draft.name]), b = G(() => l.savedSnapshot !== null && d() !== l.savedSnapshot), f = G(() => l.draft.fields.some((z) => !z.base)), o = G(() => !1), m = G(() => Object.fromEntries(l.reports.map((z) => [z.key, z])));
  async function M(z = null) {
    l.loading = !0;
    try {
      l.draft = z ? mi(z) : Ct(), l.reports = await t.combine.reports(), l.savedSnapshot = d(), f.value && $();
    } catch (B) {
      u.error(B);
    } finally {
      l.loading = !1;
    }
  }
  function i() {
    const z = l.draft;
    return z.period === "custom" ? `${z.from}~${z.to}` : z.period;
  }
  function r(z) {
    return `${z}|${l.draft.level}|${i()}`;
  }
  async function a(z) {
    var q, L;
    const B = r(z);
    if (!((q = l.fieldsByReport[B]) != null && q.fields || (L = l.fieldsByReport[B]) != null && L.loading)) {
      l.fieldsByReport[B] = { loading: !0, fields: null, error: null };
      try {
        const D = l.draft, A = D.period === "custom" ? D.from && D.to ? [D.from, D.to] : void 0 : D.period, T = await t.combine.fields(z, { level: D.level, period: A, lines: D.lines });
        l.fieldsByReport[B] = { loading: !1, fields: T, error: null };
      } catch (D) {
        l.fieldsByReport[B] = { loading: !1, fields: null, error: D.message };
      }
    }
  }
  function c(z) {
    return l.fieldsByReport[r(z)] ?? null;
  }
  function k(z) {
    const B = new Set(l.draft.fields.map((L) => L.as));
    let q = Yt(z) || "column";
    for (let L = 2; B.has(q); L++) q = `${Yt(z)}_${L}`;
    return q;
  }
  function C(z, B) {
    return l.draft.fields.some((q) => q.report === z && q.field === B);
  }
  function h(z, B) {
    var D;
    const q = l.draft.fields.find((A) => A.report === z && A.field === B.key);
    if (q) {
      O(q.uid);
      return;
    }
    const L = ((D = m.value[z]) == null ? void 0 : D.label) ?? z;
    l.draft.fields.push({ uid: st(), report: z, field: B.key, as: k(B.key), label: `${B.label} (${L})` });
  }
  function p(z) {
    var D;
    const B = l.draft.fields.find((A) => A.base === z);
    if (B) {
      O(B.uid);
      return;
    }
    const q = l.draft.fields.findIndex((A) => !A.base), L = { uid: st(), base: z, as: k(z), label: ((D = rs.find((A) => A.key === z)) == null ? void 0 : D.label) ?? z };
    l.draft.fields.splice(q === -1 ? l.draft.fields.length : q, 0, L);
  }
  function v({ label: z, formula: B }) {
    const q = { uid: st(), formula: B, as: k(z || "formula"), label: z || "Formula" };
    return l.draft.fields.push(q), q;
  }
  function w(z, B) {
    const q = l.draft.fields.find((L) => L.uid === z);
    q && Object.assign(q, B);
  }
  function O(z) {
    const B = l.draft.fields.find((q) => q.uid === z);
    l.draft.fields = l.draft.fields.filter((q) => q.uid !== z), B && (l.draft.sort = l.draft.sort.filter((q) => q.field !== B.as));
  }
  function _(z, B) {
    const q = [...l.draft.fields], L = q.findIndex((D) => D.uid === z);
    L === -1 || B < 0 || B >= q.length || (q.splice(B, 0, q.splice(L, 1)[0]), l.draft.fields = q);
  }
  let S = null;
  function $() {
    if (!f.value) {
      l.error = null, l.meta = null;
      return;
    }
    l.runSeq++;
  }
  he(() => JSON.stringify(g.value), () => {
    clearTimeout(S), S = setTimeout($, 450);
  }), he(() => [l.draft.level, i()], () => {
    for (const z of Object.keys(l.fieldsByReport))
      l.fieldsByReport[z].fields === null && !l.fieldsByReport[z].loading && delete l.fieldsByReport[z];
  });
  async function X({ offset: z = 0, top: B = !1, size: q = ci, fresh: L = !1 } = {}) {
    const D = B && (z === 0 || L);
    D && (l.running = !0, l.error = null);
    try {
      const A = await t.query.rows(g.value, { offset: z, size: q });
      return D && (l.meta = { ...A.meta, columns: A.columns }), A;
    } catch (A) {
      throw D && (l.error = A), A;
    } finally {
      D && (l.running = !1);
    }
  }
  function W(z) {
    const B = l.draft.sort.find((q) => q.field === z);
    l.draft.sort = B ? B.dir === "asc" ? [{ field: z, dir: "desc" }] : [] : [{ field: z, dir: "asc" }];
  }
  async function pe({ name: z, description: B, folder: q, visibility: L, copy: D = !1 } = {}) {
    const A = l.draft, T = {
      name: (z ?? A.name).trim() || "Untitled combined report",
      description: B ?? A.description,
      folder: (q ?? A.folder) || null,
      visibility: L ?? A.visibility,
      definition: g.value
    };
    l.saving = !0;
    try {
      const V = A.uuid && !D && A.canEdit ? await t.reports.update(A.uuid, T) : await t.reports.create(T);
      return Object.assign(A, {
        uuid: V.uuid,
        name: V.name,
        description: V.description ?? "",
        folder: V.folder ?? "",
        visibility: V.visibility,
        canEdit: V.can_edit,
        canPublish: V.can_publish ?? !1,
        published: V.published ?? !1
      }), l.savedSnapshot = d(), u.success(`Saved "${V.name}".`), V;
    } catch (V) {
      throw u.error(V), V;
    } finally {
      l.saving = !1;
    }
  }
  return {
    state: l,
    definition: g,
    dirty: b,
    runnable: f,
    grouped: o,
    reportsByKey: m,
    init: M,
    loadFields: a,
    fieldsOf: c,
    hasField: C,
    toggleField: h,
    toggleBase: p,
    addFormula: v,
    updateColumn: w,
    removeColumn: O,
    moveColumn: _,
    run: $,
    fetchRows: X,
    toggleSort: W,
    fetchSummary: () => t.query.summary(g.value),
    exportReport: async (z) => {
      try {
        const B = await t.query.export(g.value, z, { name: l.draft.name || "report" });
        u.success(`Exported "${B}".`);
      } catch (B) {
        throw u.error(B), B;
      }
    },
    gridKey: G(() => l.draft.uuid ? `report:${l.draft.uuid}` : null),
    save: pe
  };
}
const vi = {
  class: "rg-multi",
  style: { position: "relative" }
}, fi = ["aria-expanded", "aria-label"], bi = { class: "rg-search" }, hi = { class: "rg-sr-only" }, yi = ["placeholder"], $i = ["aria-label"], _i = {
  key: 0,
  class: "rg-faint"
}, ki = {
  key: 1,
  class: "rg-faint"
}, wi = ["aria-selected"], xi = ["checked", "onChange"], Ci = { class: "rg-pop__foot" }, Si = ["disabled"], Ye = {
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
    const l = t, g = u, d = K(!1), b = K(""), f = K([]), o = K(/* @__PURE__ */ new Map()), m = K(!1);
    let M = 0, i = null;
    async function r() {
      const p = ++M;
      m.value = !0;
      try {
        const v = await l.load(b.value.trim());
        if (p !== M) return;
        f.value = v, v.forEach((w) => o.value.set(w.id, w.label));
      } catch {
        p === M && (f.value = []);
      } finally {
        p === M && (m.value = !1);
      }
    }
    he(b, () => {
      clearTimeout(i), i = setTimeout(r, 250);
    }), he(d, (p) => p && r()), he(() => l.dependsOn, () => {
      f.value = [], d.value && r();
    }, { deep: !0 });
    const a = G(() => new Set(l.modelValue)), c = G(() => l.modelValue.length ? l.modelValue.length === 1 ? o.value.get(l.modelValue[0]) ?? "1 selected" : `${l.modelValue.length} selected` : l.allLabel);
    function k(p) {
      const v = a.value.has(p) ? l.modelValue.filter((w) => w !== p) : [...l.modelValue, p];
      g("update:modelValue", v);
    }
    function C() {
      g("update:modelValue", []);
    }
    function h() {
      d.value = !1, g("change");
    }
    return (p, v) => (s(), n("div", vi, [
      e("button", {
        type: "button",
        class: "rg-input rg-multi__button",
        "aria-expanded": d.value,
        "aria-label": `${t.label}: ${c.value}`,
        onClick: v[0] || (v[0] = (w) => d.value ? h() : d.value = !0)
      }, [
        e("span", {
          class: ne({ "rg-faint": !t.modelValue.length })
        }, y(c.value), 3),
        E(F, {
          name: "chevron",
          small: "",
          class: "rg-multi__chev"
        })
      ], 8, fi),
      E(it, { name: "rg-swap" }, {
        default: de(() => [
          d.value ? (s(), ae(Et, {
            key: 0,
            class: "rg-multi__pop",
            onClose: h
          }, {
            default: de(() => [
              e("label", bi, [
                e("span", hi, "Search " + y(t.label), 1),
                E(F, { name: "search" }),
                se(e("input", {
                  "onUpdate:modelValue": v[1] || (v[1] = (w) => b.value = w),
                  class: "rg-input",
                  type: "search",
                  placeholder: `Search ${t.label.toLowerCase()}`,
                  autocomplete: "off"
                }, null, 8, yi), [
                  [ce, b.value]
                ])
              ]),
              e("ul", {
                class: "rg-multi__list",
                role: "listbox",
                "aria-label": t.label,
                "aria-multiselectable": "true"
              }, [
                m.value && !f.value.length ? (s(), n("li", _i, [
                  E(F, {
                    name: "loader",
                    spin: "",
                    small: ""
                  }),
                  v[2] || (v[2] = N(" Loading…", -1))
                ])) : f.value.length ? x("", !0) : (s(), n("li", ki, "Nothing to pick.")),
                (s(!0), n(U, null, H(f.value, (w) => (s(), n("li", {
                  key: w.id,
                  role: "option",
                  "aria-selected": a.value.has(w.id)
                }, [
                  e("label", null, [
                    e("input", {
                      type: "checkbox",
                      class: "rg-check",
                      checked: a.value.has(w.id),
                      onChange: (O) => k(w.id)
                    }, null, 40, xi),
                    N(" " + y(w.label), 1)
                  ])
                ], 8, wi))), 128))
              ], 8, $i),
              e("div", Ci, [
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--ghost",
                  disabled: !t.modelValue.length,
                  onClick: C
                }, "Clear", 8, Si),
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--primary",
                  onClick: h
                }, "Done")
              ])
            ]),
            _: 1
          })) : x("", !0)
        ]),
        _: 1
      })
    ]));
  }
}, Mi = { class: "rg-kpi" }, Ti = { class: "rg-kpi__label" }, Ei = ["aria-label"], Oi = {
  __name: "KpiTile",
  props: {
    label: { type: String, required: !0 },
    value: { type: [Number, null], default: null },
    column: { type: Object, required: !0 }
  },
  setup(t) {
    const u = t, l = K(u.value);
    let g = null;
    function d(f, o) {
      var r;
      cancelAnimationFrame(g);
      const m = typeof window < "u" && ((r = window.matchMedia) == null ? void 0 : r.call(window, "(prefers-reduced-motion: reduce)").matches);
      if (o === null || f === null || m || typeof requestAnimationFrame > "u") {
        l.value = o;
        return;
      }
      const M = performance.now(), i = (a) => {
        const c = Math.min(1, (a - M) / 650), k = 1 - (1 - c) ** 3;
        l.value = f + (o - f) * k, c < 1 ? g = requestAnimationFrame(i) : l.value = o;
      };
      g = requestAnimationFrame(i);
    }
    he(() => u.value, (f, o) => d(o ?? 0, f)), Se(() => d(0, u.value)), Ne(() => cancelAnimationFrame(g));
    const b = (f) => f == null ? "—" : ke(u.column.type === "integer" ? Math.round(f) : f, u.column);
    return (f, o) => (s(), n("div", Mi, [
      e("span", Ti, y(t.label), 1),
      e("span", {
        class: "rg-kpi__value rg-num",
        "aria-label": b(t.value)
      }, y(b(l.value)), 9, Ei)
    ]));
  }
};
function is(t, u = 4) {
  if (!Number.isFinite(t) || t <= 0) return { max: 1, ticks: [0, 1] };
  const l = t / u, g = 10 ** Math.floor(Math.log10(l)), d = [1, 2, 2.5, 5, 10].map((o) => o * g).find((o) => o >= l) ?? 10 * g, b = Math.ceil(t / d) * d, f = [];
  for (let o = 0; o <= b + d / 2; o += d) f.push(Math.round(o * 1e6) / 1e6);
  return { max: b, ticks: f };
}
function us(t, u) {
  return u < 1e4 ? new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(t) : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(t);
}
function Dt(t, u) {
  if (!t) return () => {
  };
  if (u(t.clientWidth || 600), typeof ResizeObserver > "u") return () => {
  };
  const l = new ResizeObserver((g) => u(Math.max(120, Math.round(g[0].contentRect.width))));
  return l.observe(t), () => l.disconnect();
}
const Ri = ["width", "height", "aria-label"], Di = ["transform", "onMouseenter"], Ai = ["y", "width", "height"], Li = ["x", "y"], Ni = ["transform"], Vi = ["width"], Pi = ["d"], Fi = ["x", "y"], qi = { class: "rg-num" }, Ae = 22, nt = 10, Ii = 72, Ui = {
  __name: "BarChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 }
  },
  setup(t) {
    const u = t, l = K(null), g = K(600), d = K(null);
    let b = () => {
    };
    Se(() => b = Dt(l.value, (a) => g.value = a)), Ne(() => b());
    const f = G(() => Math.min(180, Math.max(80, g.value * 0.32))), o = G(() => Math.max(40, g.value - f.value - Ii - 12)), m = G(() => Math.max(0, ...u.rows.map((a) => Number(a[u.value.alias]) || 0))), M = G(() => u.rows.map((a, c) => {
      const k = Number(a[u.value.alias]) || 0, C = m.value > 0 ? Math.max(k > 0 ? 3 : 0, k / m.value * o.value) : 0;
      return { i: c, row: a, v: k, w: C, y: c * (Ae + nt), name: ke(a[u.category.alias], u.category) || "(empty)", text: ke(a[u.value.alias], u.value) };
    })), i = G(() => Math.max(Ae, u.rows.length * (Ae + nt) - nt));
    function r(a) {
      if (a <= 0) return "";
      const c = Math.min(4, a / 2, Ae / 2);
      return `M0,0 H${a - c} Q${a},0 ${a},${c} V${Ae - c} Q${a},${Ae} ${a - c},${Ae} H0 Z`;
    }
    return (a, c) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-bar",
      onMouseleave: c[0] || (c[0] = (k) => d.value = null)
    }, [
      (s(), n("svg", {
        width: g.value,
        height: i.value,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`
      }, [
        (s(!0), n(U, null, H(M.value, (k) => (s(), n("g", {
          key: k.i,
          transform: `translate(0, ${k.y})`,
          class: "rg-bar__row",
          onMouseenter: (C) => d.value = k
        }, [
          e("rect", {
            x: 0,
            y: -nt / 2,
            width: g.value,
            height: Ae + nt,
            fill: "transparent"
          }, null, 8, Ai),
          e("text", {
            x: f.value - 8,
            y: Ae / 2,
            class: "rg-chart__label",
            "text-anchor": "end",
            "dominant-baseline": "central"
          }, y(k.name.length > 24 ? `${k.name.slice(0, 23)}…` : k.name), 9, Li),
          e("g", {
            transform: `translate(${f.value}, 0)`
          }, [
            e("rect", {
              width: o.value,
              height: Ae,
              class: "rg-bar__track",
              rx: "4"
            }, null, 8, Vi),
            e("path", {
              d: r(k.w),
              class: ne(["rg-bar__fill rg-series-1", { "is-dim": d.value && d.value.i !== k.i }]),
              style: Me({ "--rg-delay": `${k.i * 40}ms` })
            }, null, 14, Pi),
            e("text", {
              x: k.w + 6,
              y: Ae / 2,
              class: "rg-chart__value",
              "dominant-baseline": "central"
            }, y(k.text), 9, Fi)
          ], 8, Ni)
        ], 40, Di))), 128))
      ], 8, Ri)),
      d.value ? (s(), n("div", {
        key: 0,
        class: "rg-chart__tip",
        style: Me({ top: `${d.value.y - 6}px`, insetInlineStart: `${f.value + Math.min(d.value.w, o.value - 120)}px` }),
        role: "status"
      }, [
        e("b", null, y(d.value.name), 1),
        e("span", null, [
          N(y(t.value.label) + ": ", 1),
          e("b", qi, y(d.value.text), 1)
        ])
      ], 4)) : x("", !0)
    ], 544));
  }
}, ji = {
  key: 0,
  class: "rg-legend"
}, zi = ["width", "height", "aria-label"], Bi = ["transform"], Gi = { class: "rg-chart__grid" }, Ki = ["transform"], Hi = ["x2"], Wi = {
  x: "-8",
  "dominant-baseline": "central",
  "text-anchor": "end",
  class: "rg-chart__axis"
}, Yi = ["x", "y"], Ji = ["d"], Zi = ["d"], Qi = ["cx", "cy"], Xi = ["x", "y"], eu = { key: 0 }, tu = ["x1", "x2", "y2"], su = ["cx", "cy"], lu = { class: "rg-num" }, nu = {
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
    const u = t, l = K(null), g = K(600), d = K(null);
    let b = () => {
    };
    Se(() => b = Dt(l.value, (h) => g.value = h)), Ne(() => b());
    const f = { top: 12, right: 64, bottom: 28, left: 52 }, o = G(() => Math.max(40, g.value - f.left - f.right)), m = G(() => u.height - f.top - f.bottom), M = G(() => is(Math.max(0, ...u.rows.flatMap((h) => u.values.map((p) => Number(h[p.alias]) || 0))))), i = (h) => u.rows.length < 2 ? o.value / 2 : h / (u.rows.length - 1) * o.value, r = (h) => m.value - (Number(h) || 0) / M.value.max * m.value, a = G(() => u.values.map((h, p) => {
      const v = u.rows.map((_, S) => [i(S), _[h.alias] === null || _[h.alias] === void 0 ? null : r(_[h.alias])]);
      let w = "";
      v.forEach(([_, S], $) => {
        var X;
        S !== null && (w += `${w === "" || ((X = v[$ - 1]) == null ? void 0 : X[1]) === null ? "M" : "L"}${_.toFixed(1)},${S.toFixed(1)}`);
      });
      const O = [...v].reverse().find((_) => _[1] !== null);
      return { column: h, slot: p + 1, d: w, area: u.area && w ? `${w}L${i(u.rows.length - 1)},${m.value}L${i(0)},${m.value}Z` : null, last: O };
    })), c = G(() => {
      const h = u.rows.length, p = Math.max(1, Math.ceil(h / Math.max(2, Math.floor(o.value / 70)))), v = u.rows.map((O, _) => ({ i: _, text: ke(O[u.category.alias], u.category) })).filter((O) => O.i % p === 0 || O.i === h - 1), w = v[v.length - 1];
      return v.filter((O) => O === w || i(w.i) - i(O.i) >= 64);
    });
    function k(h) {
      const p = h.currentTarget.getBoundingClientRect(), v = h.clientX - p.left - f.left;
      if (u.rows.length === 0) return;
      const w = u.rows.length < 2 ? 0 : Math.round(v / o.value * (u.rows.length - 1));
      d.value = Math.min(u.rows.length - 1, Math.max(0, w));
    }
    const C = (h) => {
      var p;
      return ke((p = u.rows[u.rows.length - 1]) == null ? void 0 : p[h.column.alias], h.column);
    };
    return (h, p) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-line"
    }, [
      t.values.length > 1 ? (s(), n("ul", ji, [
        (s(!0), n(U, null, H(a.value, (v) => (s(), n("li", {
          key: v.column.alias
        }, [
          e("i", {
            class: ne(`rg-swatch rg-series-${v.slot}`)
          }, null, 2),
          N(y(v.column.label), 1)
        ]))), 128))
      ])) : x("", !0),
      (s(), n("svg", {
        width: g.value,
        height: t.height,
        role: "img",
        "aria-label": `${t.values.map((v) => v.label).join(", ")} by ${t.category.label}`,
        onMousemove: k,
        onMouseleave: p[0] || (p[0] = (v) => d.value = null)
      }, [
        e("g", {
          transform: `translate(${f.left}, ${f.top})`
        }, [
          e("g", Gi, [
            (s(!0), n(U, null, H(M.value.ticks, (v) => (s(), n("g", {
              key: v,
              transform: `translate(0, ${r(v)})`
            }, [
              e("line", { x2: o.value }, null, 8, Hi),
              e("text", Wi, y(R(us)(v, M.value.max)), 1)
            ], 8, Ki))), 128))
          ]),
          (s(!0), n(U, null, H(c.value, (v) => (s(), n("text", {
            key: v.i,
            x: i(v.i),
            y: m.value + 18,
            "text-anchor": "middle",
            class: "rg-chart__axis"
          }, y(v.text), 9, Yi))), 128)),
          (s(!0), n(U, null, H(a.value, (v) => se((s(), n("path", {
            key: `a${v.slot}`,
            d: v.area ?? "",
            class: ne(`rg-line__area rg-series-${v.slot}`)
          }, null, 10, Ji)), [
            [Ut, v.area]
          ])), 128)),
          (s(!0), n(U, null, H(a.value, (v) => (s(), n("path", {
            key: `l${v.slot}`,
            d: v.d,
            class: ne(`rg-line__path rg-series-${v.slot}`),
            pathLength: "1"
          }, null, 10, Zi))), 128)),
          (s(!0), n(U, null, H(a.value, (v) => se((s(), n("g", {
            key: `e${v.slot}`
          }, [
            v.last ? (s(), n("circle", {
              key: 0,
              cx: v.last[0],
              cy: v.last[1],
              r: "4",
              class: ne(`rg-line__dot rg-series-${v.slot}`)
            }, null, 10, Qi)) : x("", !0),
            v.last && t.values.length <= 4 ? (s(), n("text", {
              key: 1,
              x: v.last[0] + 8,
              y: v.last[1],
              "dominant-baseline": "central",
              class: "rg-chart__value"
            }, y(C(v)), 9, Xi)) : x("", !0)
          ])), [
            [Ut, v.last]
          ])), 128)),
          d.value !== null ? (s(), n("g", eu, [
            e("line", {
              x1: i(d.value),
              x2: i(d.value),
              y2: m.value,
              class: "rg-line__cross"
            }, null, 8, tu),
            (s(!0), n(U, null, H(a.value, (v) => {
              var w, O;
              return s(), n(U, {
                key: `h${v.slot}`
              }, [
                ((w = t.rows[d.value]) == null ? void 0 : w[v.column.alias]) !== null && ((O = t.rows[d.value]) == null ? void 0 : O[v.column.alias]) !== void 0 ? (s(), n("circle", {
                  key: 0,
                  cx: i(d.value),
                  cy: r(t.rows[d.value][v.column.alias]),
                  r: "4",
                  class: ne(`rg-line__dot rg-series-${v.slot}`)
                }, null, 10, su)) : x("", !0)
              ], 64);
            }), 128))
          ])) : x("", !0)
        ], 8, Bi)
      ], 40, zi)),
      d.value !== null ? (s(), n("div", {
        key: 1,
        class: "rg-chart__tip",
        style: Me({ top: "8px", insetInlineStart: `${Math.min(f.left + i(d.value) + 12, g.value - 180)}px` }),
        role: "status"
      }, [
        e("b", null, y(R(ke)(t.rows[d.value][t.category.alias], t.category)), 1),
        (s(!0), n(U, null, H(a.value, (v) => (s(), n("span", {
          key: v.column.alias
        }, [
          t.values.length > 1 ? (s(), n("i", {
            key: 0,
            class: ne(`rg-swatch rg-series-${v.slot}`)
          }, null, 2)) : x("", !0),
          N(y(v.column.label) + ": ", 1),
          e("b", lu, y(R(ke)(t.rows[d.value][v.column.alias], v.column)), 1)
        ]))), 128))
      ], 4)) : x("", !0)
    ], 512));
  }
}, au = { class: "rg-chart rg-share" }, ou = ["aria-label"], ru = ["onMouseenter"], iu = { class: "rg-share__legend" }, uu = ["onMouseenter"], du = { class: "rg-share__name" }, cu = { class: "rg-num" }, gu = { class: "rg-num rg-faint" }, mu = {
  __name: "ShareBar",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    /** Every part when the widget asked for more; only `parts` get their own color. */
    parts: { type: Number, default: 6 }
  },
  setup(t) {
    const u = t, l = K(null), g = G(() => u.rows.reduce((f, o) => f + Math.max(0, Number(o[u.value.alias]) || 0), 0)), d = G(() => {
      const f = [...u.rows].sort((r, a) => (Number(a[u.value.alias]) || 0) - (Number(r[u.value.alias]) || 0)), o = f.slice(0, Math.min(6, u.parts)), m = f.slice(o.length), M = o.map((r, a) => ({ key: a, slot: a + 1, name: ke(r[u.category.alias], u.category) || "(empty)", v: Math.max(0, Number(r[u.value.alias]) || 0) })), i = m.reduce((r, a) => r + Math.max(0, Number(a[u.value.alias]) || 0), 0);
      return i > 0 && M.push({ key: "other", slot: "other", name: `Other (${m.length})`, v: i }), M.map((r) => ({ ...r, share: g.value > 0 ? r.v / g.value : 0, text: ke(r.v, u.value) }));
    }), b = (f) => new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(f);
    return (f, o) => (s(), n("div", au, [
      e("div", {
        class: "rg-share__bar",
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`,
        onMouseleave: o[0] || (o[0] = (m) => l.value = null)
      }, [
        (s(!0), n(U, null, H(d.value, (m, M) => (s(), n("span", {
          key: m.key,
          class: ne(["rg-share__seg", `rg-series-${m.slot}`, { "is-dim": l.value !== null && l.value !== m.key }]),
          style: Me({ flexGrow: m.share, "--rg-delay": `${M * 60}ms` }),
          onMouseenter: (i) => l.value = m.key
        }, null, 46, ru))), 128))
      ], 40, ou),
      e("ul", iu, [
        (s(!0), n(U, null, H(d.value, (m) => (s(), n("li", {
          key: m.key,
          class: ne({ "is-hover": l.value === m.key }),
          onMouseenter: (M) => l.value = m.key,
          onMouseleave: o[1] || (o[1] = (M) => l.value = null)
        }, [
          e("i", {
            class: ne(`rg-swatch rg-series-${m.slot}`)
          }, null, 2),
          e("span", du, y(m.name), 1),
          e("b", cu, y(m.text), 1),
          e("span", gu, y(b(m.share)), 1)
        ], 42, uu))), 128))
      ])
    ]));
  }
}, pu = ["width", "height", "aria-label"], vu = ["transform"], fu = { class: "rg-chart__grid" }, bu = ["transform"], hu = ["x2"], yu = {
  x: "-8",
  "dominant-baseline": "central",
  "text-anchor": "end",
  class: "rg-chart__axis"
}, $u = ["onMouseenter"], _u = ["x", "width", "height"], ku = ["d", "transform"], wu = ["x", "y"], xu = ["x", "y"], Cu = { class: "rg-num" }, Su = {
  __name: "ColumnChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    height: { type: Number, default: 240 }
  },
  setup(t) {
    const u = t, l = K(null), g = K(600), d = K(null);
    let b = () => {
    };
    Se(() => b = Dt(l.value, (p) => g.value = p)), Ne(() => b());
    const f = { top: 18, right: 8, bottom: 36, left: 48 }, o = G(() => Math.max(40, g.value - f.left - f.right)), m = G(() => u.height - f.top - f.bottom), M = G(() => is(Math.max(0, ...u.rows.map((p) => Number(p[u.value.alias]) || 0)))), i = G(() => o.value / Math.max(1, u.rows.length)), r = G(() => Math.min(24, Math.max(4, i.value - 6))), a = G(() => u.rows.map((p, v) => {
      const O = Math.max(0, Number(p[u.value.alias]) || 0) / M.value.max * m.value;
      return {
        i: v,
        h: O,
        x: v * i.value + (i.value - r.value) / 2,
        name: ke(p[u.category.alias], u.category) || "(empty)",
        text: ke(p[u.value.alias], u.value)
      };
    })), c = G(() => Math.max(3, Math.floor(i.value / 6.5))), k = (p) => p.length > c.value ? `${p.slice(0, c.value - 1)}…` : p, C = G(() => i.value >= 34);
    function h(p) {
      if (p <= 0) return "";
      const v = r.value, w = Math.min(4, v / 2, p);
      return `M0,${p} V${w} Q0,0 ${w},0 H${v - w} Q${v},0 ${v},${w} V${p} Z`;
    }
    return (p, v) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-column",
      onMouseleave: v[0] || (v[0] = (w) => d.value = null)
    }, [
      (s(), n("svg", {
        width: g.value,
        height: t.height,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`
      }, [
        e("g", {
          transform: `translate(${f.left}, ${f.top})`
        }, [
          e("g", fu, [
            (s(!0), n(U, null, H(M.value.ticks, (w) => (s(), n("g", {
              key: w,
              transform: `translate(0, ${m.value - w / M.value.max * m.value})`
            }, [
              e("line", { x2: o.value }, null, 8, hu),
              e("text", yu, y(R(us)(w, M.value.max)), 1)
            ], 8, bu))), 128))
          ]),
          (s(!0), n(U, null, H(a.value, (w) => (s(), n("g", {
            key: w.i,
            onMouseenter: (O) => d.value = w
          }, [
            e("rect", {
              x: w.i * i.value,
              y: "0",
              width: i.value,
              height: m.value,
              fill: "transparent"
            }, null, 8, _u),
            e("path", {
              d: h(w.h),
              transform: `translate(${w.x}, ${m.value - w.h})`,
              class: ne(["rg-column__fill rg-series-1", { "is-dim": d.value && d.value.i !== w.i }]),
              style: Me({ "--rg-delay": `${w.i * 40}ms` })
            }, null, 14, ku),
            C.value ? (s(), n("text", {
              key: 0,
              x: w.x + r.value / 2,
              y: m.value - w.h - 6,
              "text-anchor": "middle",
              class: "rg-chart__value"
            }, y(w.text), 9, wu)) : x("", !0),
            e("text", {
              x: w.x + r.value / 2,
              y: m.value + 16,
              "text-anchor": "middle",
              class: "rg-chart__axis"
            }, y(k(w.name)), 9, xu)
          ], 40, $u))), 128))
        ], 8, vu)
      ], 8, pu)),
      d.value ? (s(), n("div", {
        key: 0,
        class: "rg-chart__tip",
        style: Me({ top: `${Math.max(0, f.top + m.value - d.value.h - 56)}px`, insetInlineStart: `${Math.min(f.left + d.value.x + r.value + 6, g.value - 170)}px` }),
        role: "status"
      }, [
        e("b", null, y(d.value.name), 1),
        e("span", null, [
          N(y(t.value.label) + ": ", 1),
          e("b", Cu, y(d.value.text), 1)
        ])
      ], 4)) : x("", !0)
    ], 544));
  }
}, Mu = { class: "rg-chart rg-pie" }, Tu = ["viewBox", "aria-label"], Eu = ["d", "onMouseenter"], Ou = {
  key: 0,
  class: "rg-pie__centre"
}, Ru = ["x", "y"], Du = ["x", "y"], Au = { class: "rg-share__legend rg-pie__legend" }, Lu = ["onMouseenter"], Nu = { class: "rg-share__name" }, Vu = { class: "rg-num" }, Pu = { class: "rg-num rg-faint" }, Ve = 168, Fu = {
  __name: "PieChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    donut: { type: Boolean, default: !1 },
    parts: { type: Number, default: 6 }
  },
  setup(t) {
    const u = t, l = K(null), g = Ve / 2 - 2, d = G(() => u.donut ? g * 0.6 : 0), b = G(() => u.rows.reduce((i, r) => i + Math.max(0, Number(r[u.value.alias]) || 0), 0)), f = G(() => {
      const i = [...u.rows].sort((h, p) => (Number(p[u.value.alias]) || 0) - (Number(h[u.value.alias]) || 0)), r = i.slice(0, Math.min(6, u.parts)), a = i.slice(r.length), c = r.map((h, p) => ({ key: p, slot: p + 1, name: ke(h[u.category.alias], u.category) || "(empty)", v: Math.max(0, Number(h[u.value.alias]) || 0) })), k = a.reduce((h, p) => h + Math.max(0, Number(p[u.value.alias]) || 0), 0);
      k > 0 && c.push({ key: "other", slot: "other", name: `Other (${a.length})`, v: k });
      let C = -Math.PI / 2;
      return c.filter((h) => h.v > 0).map((h) => {
        const p = b.value > 0 ? h.v / b.value : 0, v = C;
        return C += p * Math.PI * 2, { ...h, share: p, start: v, end: C, text: ke(h.v, u.value) };
      });
    });
    function o(i, r, a, c) {
      r - i >= Math.PI * 2 - 1e-6 && (r = i + Math.PI * 2 - 1e-4);
      const k = r - i > Math.PI ? 1 : 0, C = (h, p) => `${(g + 2 + h * Math.cos(p)).toFixed(2)},${(g + 2 + h * Math.sin(p)).toFixed(2)}`;
      return c <= 0 ? `M${g + 2},${g + 2} L${C(a, i)} A${a},${a} 0 ${k} 1 ${C(a, r)} Z` : `M${C(a, i)} A${a},${a} 0 ${k} 1 ${C(a, r)} L${C(c, r)} A${c},${c} 0 ${k} 0 ${C(c, i)} Z`;
    }
    const m = (i) => new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(i), M = G(() => l.value !== null ? f.value.find((i) => i.key === l.value) : null);
    return (i, r) => (s(), n("div", Mu, [
      (s(), n("svg", {
        width: Ve,
        height: Ve,
        viewBox: `0 0 ${Ve} ${Ve}`,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`,
        class: "rg-pie__svg",
        onMouseleave: r[0] || (r[0] = (a) => l.value = null)
      }, [
        (s(!0), n(U, null, H(f.value, (a, c) => (s(), n("path", {
          key: a.key,
          d: o(a.start, a.end, l.value === a.key ? g : g - 3, d.value),
          class: ne(["rg-pie__slice", `rg-series-${a.slot}`, { "is-dim": l.value !== null && l.value !== a.key }]),
          style: Me({ "--rg-delay": `${c * 70}ms` }),
          onMouseenter: (k) => l.value = a.key
        }, null, 46, Eu))), 128)),
        t.donut ? (s(), n("g", Ou, [
          e("text", {
            x: Ve / 2,
            y: Ve / 2 - 6,
            "text-anchor": "middle",
            class: "rg-pie__total rg-num"
          }, y(M.value ? m(M.value.share) : R(ke)(b.value, t.value)), 9, Ru),
          e("text", {
            x: Ve / 2,
            y: Ve / 2 + 13,
            "text-anchor": "middle",
            class: "rg-chart__axis"
          }, y(M.value ? M.value.name.slice(0, 18) : "Total"), 9, Du)
        ])) : x("", !0)
      ], 40, Tu)),
      e("ul", Au, [
        (s(!0), n(U, null, H(f.value, (a) => (s(), n("li", {
          key: a.key,
          class: ne({ "is-hover": l.value === a.key }),
          onMouseenter: (c) => l.value = a.key,
          onMouseleave: r[1] || (r[1] = (c) => l.value = null)
        }, [
          e("i", {
            class: ne(`rg-swatch rg-series-${a.slot}`)
          }, null, 2),
          e("span", Nu, y(a.name), 1),
          e("b", Vu, y(a.text), 1),
          e("span", Pu, y(m(a.share)), 1)
        ], 42, Lu))), 128))
      ])
    ]));
  }
}, qu = { class: "rg-widget__head" }, Iu = { class: "rg-widget__titles" }, Uu = {
  key: 0,
  class: "rg-faint"
}, ju = ["aria-busy"], zu = {
  key: 0,
  class: "rg-widget__locked"
}, Bu = { class: "rg-empty__icon" }, Gu = {
  key: 1,
  class: "rg-widget__skeleton"
}, Ku = {
  key: 2,
  class: "rg-widget__error"
}, Hu = {
  key: 3,
  class: "rg-widget__empty rg-faint"
}, Wu = {
  key: 0,
  class: "rg-kpis"
}, Yu = {
  key: 6,
  class: "rg-widget__table"
}, Ju = { class: "rg-grid" }, Zu = {
  key: 0,
  class: "rg-sr-only"
}, vt = {
  __name: "DashboardWidget",
  props: {
    widget: { type: Object, required: !0 },
    /** () => Promise<{ type, columns, rows }> */
    load: { type: Function, required: !0 },
    /** Bump to reload (filters changed). */
    version: { type: [Number, String], default: 0 }
  },
  setup(t, { expose: u }) {
    const l = t, g = ye("rg-widget-queue", null), d = K(null), b = K(null), f = K(l.widget.can_view === !1), o = K(!1);
    let m = 0;
    async function M() {
      if (l.widget.can_view === !1) {
        f.value = !0;
        return;
      }
      const C = ++m;
      o.value = !0, b.value = null;
      try {
        const h = await (g ? g(() => l.load()) : l.load());
        C === m && (d.value = h);
      } catch (h) {
        C === m && ((h == null ? void 0 : h.code) === "REPORT_FORBIDDEN" || (h == null ? void 0 : h.status) === 403) ? f.value = !0 : C === m && (b.value = (h == null ? void 0 : h.message) ?? "This widget could not load.");
      } finally {
        C === m && (o.value = !1);
      }
    }
    he(() => [l.version, JSON.stringify(l.widget)], M, { immediate: !0 });
    const i = G(() => {
      var C;
      return Object.fromEntries((((C = d.value) == null ? void 0 : C.columns) ?? []).map((h) => [h.alias, h]));
    }), r = G(() => {
      var v;
      const C = i.value[l.widget.category];
      if (!C || C.grain || !["date", "datetime"].includes(C.type)) return C ?? null;
      const h = (((v = d.value) == null ? void 0 : v.rows) ?? []).map((w) => w[C.alias]).filter((w) => w != null);
      return h.length > 1 && h.every((w) => /^\d{4}-\d{2}-01/.test(String(w))) ? { ...C, grain: "month" } : C;
    }), a = G(() => (l.widget.values ?? []).map((C) => i.value[C]).filter(Boolean)), c = G(() => d.value && d.value.rows.length === 0), k = G(() => {
      var C;
      return ((C = d.value) == null ? void 0 : C.columns) ?? [];
    });
    return u({ reload: M }), (C, h) => {
      var p;
      return s(), n("article", {
        class: ne(["rg-widget", [`rg-widget--${t.widget.type}`, `rg-widget--${t.widget.size ?? "md"}`]])
      }, [
        e("header", qu, [
          e("div", Iu, [
            e("h3", null, y(t.widget.title || (((p = a.value[0]) == null ? void 0 : p.label) ?? "Widget")), 1),
            t.widget.report_name ? (s(), n("small", Uu, y(t.widget.report_name), 1)) : x("", !0)
          ]),
          rt(C.$slots, "actions")
        ]),
        e("div", {
          class: "rg-widget__body",
          "aria-busy": o.value ? "true" : "false"
        }, [
          f.value ? (s(), n("div", zu, [
            e("span", Bu, [
              E(F, { name: "lock" })
            ]),
            e("span", null, [
              h[0] || (h[0] = N("You need access to ", -1)),
              e("b", null, y(t.widget.report_name ?? "its report"), 1),
              h[1] || (h[1] = N(" to see this.", -1))
            ])
          ])) : o.value && !d.value ? (s(), n("div", Gu, [
            (s(!0), n(U, null, H(t.widget.type === "kpi" ? 2 : 5, (v) => (s(), n("span", {
              key: v,
              class: "rg-skeleton",
              style: Me({ width: `${40 + v * 29 % 55}%` })
            }, null, 4))), 128))
          ])) : b.value ? (s(), n("p", Ku, [
            E(F, {
              name: "alert",
              small: ""
            }),
            N(" " + y(b.value), 1)
          ])) : c.value ? (s(), n("p", Hu, "No data for these filters.")) : d.value ? (s(), n(U, { key: 4 }, [
            e("div", {
              class: ne({ "rg-widget__stale": o.value })
            }, [
              t.widget.type === "kpi" ? (s(), n("div", Wu, [
                (s(!0), n(U, null, H(a.value, (v) => {
                  var w;
                  return s(), ae(Oi, {
                    key: v.alias,
                    label: a.value.length > 1 || !t.widget.title ? v.label : "",
                    value: ((w = d.value.rows[0]) == null ? void 0 : w[v.alias]) ?? null,
                    column: v
                  }, null, 8, ["label", "value", "column"]);
                }), 128))
              ])) : t.widget.type === "bar" && r.value && a.value[0] ? (s(), ae(Ui, {
                key: 1,
                rows: d.value.rows,
                category: r.value,
                value: a.value[0]
              }, null, 8, ["rows", "category", "value"])) : t.widget.type === "column" && r.value && a.value[0] ? (s(), ae(Su, {
                key: 2,
                rows: d.value.rows,
                category: r.value,
                value: a.value[0]
              }, null, 8, ["rows", "category", "value"])) : ["line", "area"].includes(t.widget.type) && r.value && a.value.length ? (s(), ae(nu, {
                key: 3,
                rows: d.value.rows,
                category: r.value,
                values: a.value,
                area: t.widget.type === "area"
              }, null, 8, ["rows", "category", "values", "area"])) : ["pie", "donut"].includes(t.widget.type) && r.value && a.value[0] ? (s(), ae(Fu, {
                key: 4,
                rows: d.value.rows,
                category: r.value,
                value: a.value[0],
                donut: t.widget.type === "donut",
                parts: t.widget.top ?? 6
              }, null, 8, ["rows", "category", "value", "donut", "parts"])) : t.widget.type === "share" && r.value && a.value[0] ? (s(), ae(mu, {
                key: 5,
                rows: d.value.rows,
                category: r.value,
                value: a.value[0],
                parts: t.widget.top ?? 6
              }, null, 8, ["rows", "category", "value", "parts"])) : t.widget.type === "table" ? (s(), n("div", Yu, [
                e("table", Ju, [
                  e("thead", null, [
                    e("tr", null, [
                      (s(!0), n(U, null, H(k.value, (v) => (s(), n("th", {
                        key: v.alias,
                        class: ne({ "rg-num": R(We)(v) })
                      }, y(v.label), 3))), 128))
                    ])
                  ]),
                  e("tbody", null, [
                    (s(!0), n(U, null, H(d.value.rows, (v, w) => (s(), n("tr", {
                      key: w,
                      class: "rg-row"
                    }, [
                      (s(!0), n(U, null, H(k.value, (O) => (s(), n("td", {
                        key: O.alias,
                        class: ne({ "rg-num": R(We)(O) })
                      }, y(R(ke)(v[O.alias], O)), 3))), 128))
                    ]))), 128))
                  ])
                ])
              ])) : x("", !0)
            ], 2),
            t.widget.type !== "table" && !f.value ? (s(), n("table", Zu, [
              e("caption", null, y(t.widget.title), 1),
              e("thead", null, [
                e("tr", null, [
                  (s(!0), n(U, null, H(k.value, (v) => (s(), n("th", {
                    key: v.alias
                  }, y(v.label), 1))), 128))
                ])
              ]),
              e("tbody", null, [
                (s(!0), n(U, null, H(d.value.rows, (v, w) => (s(), n("tr", { key: w }, [
                  (s(!0), n(U, null, H(k.value, (O) => (s(), n("td", {
                    key: O.alias
                  }, y(R(ke)(v[O.alias], O)), 1))), 128))
                ]))), 128))
              ])
            ])) : x("", !0)
          ], 64)) : x("", !0)
        ], 8, ju)
      ], 2);
    };
  }
}, He = (t) => !!t.category, qe = (t) => (t.values ?? []).length > 0, ds = [
  { value: "kpi", label: "KPI", icon: "hash", hint: "Headline numbers", fits: qe },
  { value: "bar", label: "Bar", icon: "view", hint: "Top items, across", fits: (t) => He(t) && qe(t) },
  { value: "column", label: "Column", icon: "view", hint: "Top items, upright", fits: (t) => He(t) && qe(t) },
  { value: "line", label: "Line", icon: "clock", hint: "Over time", fits: (t) => He(t) && qe(t) },
  { value: "area", label: "Area", icon: "clock", hint: "Over time, filled", fits: (t) => He(t) && qe(t) },
  { value: "pie", label: "Pie", icon: "globe", hint: "Parts of a whole", fits: (t) => He(t) && qe(t) },
  { value: "donut", label: "Donut", icon: "globe", hint: "Parts, with the total", fits: (t) => He(t) && qe(t) },
  { value: "share", label: "Share bar", icon: "table", hint: "Parts in one bar", fits: (t) => He(t) && qe(t) },
  { value: "table", label: "Table", icon: "table", hint: "First rows", fits: () => !0 }
], cs = ["bar", "column", "pie", "donut", "share"], Qu = { line: 120, area: 120, pie: 6, donut: 6, share: 6 }, Xu = { kpi: "sm", table: "full", line: "full", area: "full" };
function gs(t, u, { resize: l = !1 } = {}) {
  const g = { ...t, type: u };
  cs.includes(u) && (g.values = (t.values ?? []).slice(0, 1)), u === "kpi" && (g.category = null);
  const d = ["pie", "donut", "share"].includes(t.type), b = ["pie", "donut", "share"].includes(u), f = ["line", "area"].includes(t.type), o = ["line", "area"].includes(u);
  return (l || d !== b || f !== o) && (g.top = Qu[u] ?? 10), l && (g.size = Xu[u] ?? "md"), g;
}
const ed = { class: "rg-publish" }, td = ["for"], sd = ["id", "value"], ld = ["value"], nd = { class: "rg-publish__field" }, ad = {
  class: "rg-widget-types",
  role: "group",
  "aria-label": "Widget type"
}, od = ["aria-pressed", "onClick"], rd = ["for"], id = ["id"], ud = ["value"], dd = {
  key: 2,
  class: "rg-publish__field"
}, cd = {
  key: 0,
  class: "rg-faint"
}, gd = { class: "rg-publish__roles" }, md = ["aria-pressed", "onClick"], pd = {
  key: 0,
  class: "rg-faint"
}, vd = { class: "rg-widget-dialog__row" }, fd = ["for"], bd = ["id"], hd = ["for"], yd = ["id", "max"], $d = ["for"], _d = ["id"], kd = ["value"], ms = {
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
    const l = t, g = u, d = [["sm", "Small"], ["md", "Half"], ["lg", "Two thirds"], ["full", "Full width"]], b = G(() => cs.includes(l.widget.type)), f = G(() => ["line", "area"].includes(l.widget.type)), o = G(() => ["pie", "donut", "share"].includes(l.widget.type));
    function m(r) {
      Object.assign(l.widget, gs(l.widget, r, { resize: !0 }));
    }
    function M(r) {
      const a = l.widget;
      b.value ? a.values = [r] : a.values = a.values.includes(r) ? a.values.filter((c) => c !== r) : [...a.values, r];
    }
    function i(r) {
      Object.assign(l.widget, { report: r, category: null, values: [] }), g("report", r);
    }
    return (r, a) => (s(), n("div", ed, [
      t.reports ? (s(), n("label", {
        key: 0,
        class: "rg-publish__field",
        for: `${t.idPrefix}-report`
      }, [
        a[6] || (a[6] = e("span", null, "Report", -1)),
        e("select", {
          id: `${t.idPrefix}-report`,
          class: "rg-input",
          value: t.widget.report,
          onChange: a[0] || (a[0] = (c) => i(c.target.value))
        }, [
          a[5] || (a[5] = e("option", {
            value: "",
            disabled: ""
          }, "Pick a report", -1)),
          (s(!0), n(U, null, H(t.reports, (c) => (s(), n("option", {
            key: c.uuid,
            value: c.uuid
          }, y(c.name), 9, ld))), 128))
        ], 40, sd)
      ], 8, td)) : x("", !0),
      e("div", nd, [
        a[7] || (a[7] = e("span", null, "Show as", -1)),
        e("div", ad, [
          (s(!0), n(U, null, H(R(ds), (c) => (s(), n("button", {
            key: c.value,
            type: "button",
            class: "rg-widget-type",
            "aria-pressed": t.widget.type === c.value,
            onClick: (k) => m(c.value)
          }, [
            E(F, {
              name: c.icon,
              small: ""
            }, null, 8, ["name"]),
            e("b", null, y(c.label), 1),
            e("small", null, y(c.hint), 1)
          ], 8, od))), 128))
        ])
      ]),
      ["kpi", "table"].includes(t.widget.type) ? x("", !0) : (s(), n("label", {
        key: 1,
        class: "rg-publish__field",
        for: `${t.idPrefix}-category`
      }, [
        e("span", null, y(f.value ? "Over" : "By"), 1),
        se(e("select", {
          id: `${t.idPrefix}-category`,
          "onUpdate:modelValue": a[1] || (a[1] = (c) => t.widget.category = c),
          class: "rg-input"
        }, [
          a[8] || (a[8] = e("option", {
            value: null,
            disabled: ""
          }, "Pick a column", -1)),
          (s(!0), n(U, null, H(t.columns.dims, (c) => (s(), n("option", {
            key: c.as,
            value: c.as
          }, y(c.label), 9, ud))), 128))
        ], 8, id), [
          [Pe, t.widget.category]
        ])
      ], 8, rd)),
      t.widget.type !== "table" ? (s(), n("fieldset", dd, [
        e("legend", null, [
          N(y(b.value ? "Number" : "Numbers"), 1),
          f.value ? (s(), n("small", cd, " · pick numbers of the same scale: they share one axis")) : x("", !0)
        ]),
        e("div", gd, [
          (s(!0), n(U, null, H(t.columns.nums, (c) => (s(), n("button", {
            key: c.as,
            type: "button",
            class: "rg-publish__role",
            "aria-pressed": t.widget.values.includes(c.as),
            onClick: (k) => M(c.as)
          }, [
            E(F, {
              name: t.widget.values.includes(c.as) ? "check" : "plus",
              small: ""
            }, null, 8, ["name"]),
            N(y(c.label), 1)
          ], 8, md))), 128)),
          t.columns.loading ? (s(), n("span", pd, [
            E(F, {
              name: "loader",
              spin: "",
              small: ""
            }),
            a[9] || (a[9] = N(" Loading columns…", -1))
          ])) : x("", !0)
        ])
      ])) : x("", !0),
      e("div", vd, [
        e("label", {
          class: "rg-publish__field",
          for: `${t.idPrefix}-title`
        }, [
          a[10] || (a[10] = e("span", null, "Title", -1)),
          se(e("input", {
            id: `${t.idPrefix}-title`,
            "onUpdate:modelValue": a[2] || (a[2] = (c) => t.widget.title = c),
            class: "rg-input",
            maxlength: "160",
            placeholder: "From the numbers"
          }, null, 8, bd), [
            [ce, t.widget.title]
          ])
        ], 8, fd),
        t.widget.type !== "kpi" ? (s(), n("label", {
          key: 0,
          class: "rg-publish__field",
          for: `${t.idPrefix}-top`
        }, [
          e("span", null, y(f.value ? "Points" : o.value ? "Parts" : "Rows"), 1),
          se(e("input", {
            id: `${t.idPrefix}-top`,
            "onUpdate:modelValue": a[3] || (a[3] = (c) => t.widget.top = c),
            class: "rg-input",
            type: "number",
            min: "1",
            max: o.value ? 12 : f.value ? 400 : 50
          }, null, 8, yd), [
            [
              ce,
              t.widget.top,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, hd)) : x("", !0),
        e("label", {
          class: "rg-publish__field",
          for: `${t.idPrefix}-size`
        }, [
          a[11] || (a[11] = e("span", null, "Size", -1)),
          se(e("select", {
            id: `${t.idPrefix}-size`,
            "onUpdate:modelValue": a[4] || (a[4] = (c) => t.widget.size = c),
            class: "rg-input"
          }, [
            (s(), n(U, null, H(d, ([c, k]) => e("option", {
              key: c,
              value: c
            }, y(k), 9, kd)), 64))
          ], 8, _d), [
            [Pe, t.widget.size]
          ])
        ], 8, $d)
      ])
    ]));
  }
}, wd = {
  key: 0,
  class: "rg-pin__done"
}, xd = { class: "rg-empty__icon" }, Cd = {
  key: 0,
  class: "rg-widget-dialog__preview"
}, Sd = { class: "rg-publish__field rg-pin__target" }, Md = ["value"], Td = {
  key: 1,
  class: "rg-publish__error",
  role: "alert"
}, Ed = ["disabled"], At = {
  __name: "PinToDashboard",
  props: {
    report: { type: String, required: !0 },
    reportName: { type: String, default: "" }
  },
  emits: ["close", "pinned", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = t, g = u, { api: d } = Le(), b = ye("rg-theme", "light"), f = $e({ id: "preview", type: "bar", title: "", report: l.report, category: null, values: [], top: 10, size: "md" }), o = $e({ dims: [], nums: [], loading: !0 }), m = K([]), M = K("new"), i = K(l.reportName ? `${l.reportName} dashboard` : "New dashboard"), r = $e({ saving: !1, error: null, done: null });
    Se(async () => {
      var h;
      try {
        const [p, v] = await Promise.all([d.reports.view(l.report), d.dashboards.list().catch(() => [])]), w = p.fields ?? [];
        o.dims = w.filter((O) => O.kind === "dimension").map((O) => ({ as: O.as, label: O.label ?? O.as })), o.nums = w.filter((O) => O.kind !== "dimension").map((O) => ({ as: O.as, label: O.label ?? O.as })), f.category = ((h = o.dims[0]) == null ? void 0 : h.as) ?? null, f.values = o.nums[0] ? [o.nums[0].as] : [], f.category || Object.assign(f, { type: "kpi", size: "sm" }), m.value = v.filter((O) => O.is_owner), m.value.length && (M.value = m.value[0].uuid);
      } catch (p) {
        r.error = p.message;
      } finally {
        o.loading = !1;
      }
    });
    const a = G(() => f.type === "table" || f.values.length > 0 && (f.type === "kpi" || !!f.category)), c = G(() => JSON.stringify(f));
    function k() {
      var v;
      const { id: h, ...p } = f;
      return (v = p.title) != null && v.trim() || (p.title = p.values.map((w) => {
        var O;
        return ((O = o.nums.find((_) => _.as === w)) == null ? void 0 : O.label) ?? w;
      }).join(", ") || l.reportName || "Widget"), p;
    }
    async function C() {
      r.saving = !0, r.error = null;
      try {
        const h = M.value === "new" ? await d.dashboards.create({ name: i.value.trim() || "New dashboard", layout: { widgets: [{ id: "w1", ...k() }] } }) : await d.dashboards.pin(M.value, k());
        r.done = h, g("pinned", h);
      } catch (h) {
        r.error = h.message;
      } finally {
        r.saving = !1;
      }
    }
    return (h, p) => (s(), ae(ze, {
      title: r.done ? "Pinned" : `Pin “${t.reportName}” to a dashboard`,
      class: "rg-widget-dialog",
      "data-rg-theme": R(b),
      onClose: p[6] || (p[6] = (v) => g("close"))
    }, {
      footer: de(() => [
        r.done ? (s(), n(U, { key: 0 }, [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: p[3] || (p[3] = (v) => g("close"))
          }, "Close"),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: p[4] || (p[4] = (v) => g("open-dashboard", r.done.uuid))
          }, [
            E(F, {
              name: "view",
              small: ""
            }),
            p[12] || (p[12] = N(" Open dashboard", -1))
          ])
        ], 64)) : (s(), n(U, { key: 1 }, [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: p[5] || (p[5] = (v) => g("close"))
          }, "Cancel"),
          e("button", {
            type: "submit",
            form: "rg-pin-form",
            class: "rg-btn rg-btn--primary",
            disabled: !a.value || r.saving
          }, [
            E(F, {
              name: "plus",
              small: ""
            }),
            N(" " + y(r.saving ? "Pinning…" : "Pin"), 1)
          ], 8, Ed)
        ], 64))
      ]),
      default: de(() => [
        r.done ? (s(), n("div", wd, [
          e("span", xd, [
            E(F, { name: "check" })
          ]),
          e("p", null, [
            p[7] || (p[7] = N("Added to ", -1)),
            e("b", null, y(r.done.name), 1),
            p[8] || (p[8] = N(".", -1))
          ])
        ])) : (s(), n("form", {
          key: 1,
          id: "rg-pin-form",
          class: "rg-publish",
          onSubmit: p[2] || (p[2] = ge((v) => a.value && C(), ["prevent"]))
        }, [
          E(ms, {
            widget: f,
            columns: o,
            "id-prefix": "rg-pin"
          }, null, 8, ["widget", "columns"]),
          a.value ? (s(), n("div", Cd, [
            p[9] || (p[9] = e("span", { class: "rg-faint" }, "Preview", -1)),
            E(vt, {
              widget: { ...f, size: "full" },
              load: () => R(d).dashboards.preview(f),
              version: c.value
            }, null, 8, ["widget", "load", "version"])
          ])) : x("", !0),
          e("div", Sd, [
            p[11] || (p[11] = e("span", null, "Add to", -1)),
            se(e("select", {
              id: "rg-pin-target",
              "onUpdate:modelValue": p[0] || (p[0] = (v) => M.value = v),
              class: "rg-input"
            }, [
              (s(!0), n(U, null, H(m.value, (v) => (s(), n("option", {
                key: v.uuid,
                value: v.uuid
              }, y(v.name) + " (" + y(v.widgets_count) + " widgets)", 9, Md))), 128)),
              p[10] || (p[10] = e("option", { value: "new" }, "A new dashboard…", -1))
            ], 512), [
              [Pe, M.value]
            ]),
            M.value === "new" ? se((s(), n("input", {
              key: 0,
              id: "rg-pin-name",
              "onUpdate:modelValue": p[1] || (p[1] = (v) => i.value = v),
              class: "rg-input",
              maxlength: "255",
              "aria-label": "New dashboard name"
            }, null, 512)), [
              [ce, i.value]
            ]) : x("", !0)
          ]),
          r.error ? (s(), n("p", Td, y(r.error), 1)) : x("", !0)
        ], 32))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, Od = ["data-rg-theme"], Rd = { class: "rg-topbar" }, Dd = { class: "rg-topbar__title" }, Ad = { class: "rg-topbar__meta" }, Ld = { class: "rg-root-chip" }, Nd = { key: 0 }, Vd = {
  key: 1,
  class: "rg-badge rg-badge--success"
}, Pd = { class: "rg-topbar__actions" }, Fd = ["disabled"], qd = ["disabled"], Id = {
  key: 0,
  class: "rg-builder__body"
}, Ud = { class: "rg-explorer" }, jd = { class: "rg-skeleton-list" }, zd = {
  key: 1,
  class: "rg-builder__body"
}, Bd = {
  class: "rg-explorer rg-catalog",
  "aria-label": "Reports"
}, Gd = { class: "rg-explorer__head" }, Kd = { class: "rg-search" }, Hd = { class: "rg-catalog__list" }, Wd = {
  key: 0,
  class: "rg-list__empty"
}, Yd = ["aria-expanded", "disabled", "onClick"], Jd = {
  key: 0,
  class: "rg-faint"
}, Zd = {
  key: 1,
  class: "rg-faint"
}, Qd = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, Xd = {
  key: 0,
  class: "rg-catalog__fields"
}, ec = {
  key: 0,
  class: "rg-faint"
}, tc = {
  key: 1,
  class: "rg-catalog__error"
}, sc = ["checked", "onChange"], lc = {
  key: 0,
  class: "rg-faint"
}, nc = { class: "rg-builder__main" }, ac = { class: "rg-combined__settings" }, oc = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "One row per"
}, rc = ["aria-pressed"], ic = ["aria-pressed"], uc = {
  class: "rg-field-inline",
  for: "rg-combined-period"
}, dc = ["value"], cc = { class: "rg-field-inline" }, gc = { class: "rg-combined__columns" }, mc = {
  class: "rg-combined__base",
  role: "group",
  "aria-label": "Structure columns"
}, pc = ["aria-pressed", "onClick"], vc = ["onDragstart", "onDrop"], fc = { class: "rg-combined__text" }, bc = ["aria-label", "onKeydown"], hc = ["onClick"], yc = { class: "rg-faint" }, $c = ["aria-label", "onClick"], _c = ["aria-label", "disabled", "onClick"], kc = ["aria-label", "onClick"], wc = ["disabled"], xc = {
  class: "rg-results",
  "aria-label": "Results"
}, Cc = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, Sc = { key: 0 }, Mc = { class: "rg-num" }, Tc = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, Ec = {
  key: 2,
  class: "rg-faint"
}, Oc = {
  key: 0,
  class: "rg-errorbox",
  role: "alert"
}, Rc = { class: "rg-errorbox__title" }, Dc = {
  class: "rg-publish__field",
  for: "rg-combined-formula-label"
}, Ac = {
  class: "rg-publish__field",
  for: "rg-combined-formula-text"
}, Lc = { class: "rg-publish__field" }, Nc = { class: "rg-token-list" }, Vc = ["title", "onClick"], Pc = ["disabled"], Fc = {
  __name: "CombinedBuilder",
  props: {
    /** Saved combined report to open (from api.reports.get), or null for a new one. */
    report: { type: Object, default: null },
    theme: { type: String, default: "light" }
  },
  emits: ["saved", "published", "back", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = t, g = u, d = K(!1), { api: b } = Le(), f = ft(), o = pi(b, f);
    Re(Ee, o), ye("rg-theme", null) || Re("rg-theme", l.theme);
    const m = [
      ["this_month", "This month"],
      ["last_month", "Last month"],
      ["this_quarter", "This quarter"],
      ["last_quarter", "Last quarter"],
      ["this_year", "This year"],
      ["last_year", "Last year"],
      ["last_30_days", "Last 30 days"]
    ], M = { ...St, percent: "hash" }, i = G(() => o.state.draft), r = K(""), a = K(/* @__PURE__ */ new Set()), c = K(null), k = K(!1), C = K(null), h = K(null), p = K(null), v = G(() => {
      const A = r.value.trim().toLowerCase(), T = /* @__PURE__ */ new Map();
      for (const V of o.state.reports) {
        if (A && !V.label.toLowerCase().includes(A) && !(V.description ?? "").toLowerCase().includes(A)) continue;
        const re = V.group ?? "Reports";
        T.has(re) || T.set(re, []), T.get(re).push(V);
      }
      return [...T];
    }), w = G(() => new Set(i.value.fields.filter((A) => A.report).map((A) => A.report))), O = G(() => i.value.fields.map((A) => ({ uid: A.uid, as: A.as, label: A.label ?? A.as })));
    function _(A) {
      return A.levels.includes(i.value.level);
    }
    function S(A) {
      const T = new Set(a.value);
      T.has(A.key) ? T.delete(A.key) : (T.add(A.key), o.loadFields(A.key)), a.value = T;
    }
    function $(A) {
      var T;
      return A.base ? "Structure" : A.formula ? "Formula" : ((T = o.reportsByKey.value[A.report]) == null ? void 0 : T.label) ?? A.report;
    }
    function X(A) {
      h.value = { uid: A.uid, label: A.label ?? A.as };
    }
    function W() {
      var A, T;
      (T = (A = h.value) == null ? void 0 : A.label) != null && T.trim() && o.updateColumn(h.value.uid, { label: h.value.label.trim() }), h.value = null;
    }
    function pe(A) {
      p.value && (o.moveColumn(p.value, i.value.fields.findIndex((T) => T.uid === A)), p.value = null);
    }
    function z() {
      var T;
      const A = C.value;
      (T = A == null ? void 0 : A.formula) != null && T.trim() && (A.uid ? o.updateColumn(A.uid, { label: A.label || "Formula", formula: A.formula.trim() }) : o.addFormula({ label: A.label, formula: A.formula.trim() }), C.value = null);
    }
    function B(A) {
      C.value.formula = `${C.value.formula ?? ""}${C.value.formula && !/\s$/.test(C.value.formula) ? " " : ""}${A}`;
    }
    function q(A) {
      return b.contextOptions("lines", { search: A });
    }
    function L(A) {
      g("saved", A);
    }
    Se(() => o.init(l.report));
    const D = {
      REPORT_FAILED: "One of the reports could not run",
      DATASET_FORBIDDEN: "No access",
      LEVEL_UNSUPPORTED: "Not available at this level",
      UNKNOWN_FIELD: "Check the formula",
      INVALID_FORMULA: "Check the formula"
    };
    return (A, T) => (s(), n("div", {
      class: "rg-root rg-combined",
      "data-rg-theme": t.theme
    }, [
      e("header", Rd, [
        e("div", Dd, [
          T[32] || (T[32] = e("label", {
            class: "rg-sr-only",
            for: "rg-combined-name"
          }, "Report name", -1)),
          se(e("input", {
            id: "rg-combined-name",
            "onUpdate:modelValue": T[0] || (T[0] = (V) => i.value.name = V),
            class: "rg-input rg-input--bare rg-name-input",
            maxlength: "255"
          }, null, 512), [
            [ce, i.value.name]
          ]),
          e("div", Ad, [
            e("span", Ld, [
              E(F, {
                name: "table",
                small: ""
              }),
              T[29] || (T[29] = N(" Combined report, one row per ", -1)),
              e("b", null, y(i.value.level), 1),
              i.value.uuid ? x("", !0) : (s(), n("button", {
                key: 0,
                type: "button",
                onClick: T[1] || (T[1] = (V) => g("back"))
              }, "change type"))
            ]),
            R(o).dirty.value ? (s(), n("span", Nd, [...T[30] || (T[30] = [
              e("i", {
                class: "rg-dot",
                "aria-hidden": "true"
              }, null, -1),
              N(" Unsaved changes", -1)
            ])])) : x("", !0),
            i.value.published ? (s(), n("span", Vd, [
              E(F, {
                name: "globe",
                small: ""
              }),
              T[31] || (T[31] = N(" Published", -1))
            ])) : x("", !0)
          ])
        ]),
        e("div", Pd, [
          e("button", {
            type: "button",
            class: "rg-btn",
            disabled: !R(o).runnable.value || R(o).state.running,
            onClick: T[2] || (T[2] = (V) => R(o).run())
          }, [
            E(F, {
              name: "play",
              small: ""
            }),
            T[33] || (T[33] = N(" Run", -1))
          ], 8, Fd),
          T[37] || (T[37] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
          i.value.uuid ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn",
            title: "Add a chart or number from this report to a dashboard",
            onClick: T[3] || (T[3] = (V) => d.value = !0)
          }, [
            E(F, {
              name: "plus",
              small: ""
            }),
            T[34] || (T[34] = N(" Pin", -1))
          ])) : x("", !0),
          i.value.uuid && i.value.canPublish ? (s(), n("button", {
            key: 1,
            type: "button",
            class: "rg-btn",
            onClick: T[4] || (T[4] = (V) => k.value = !0)
          }, [
            E(F, {
              name: "globe",
              small: ""
            }),
            N(" " + y(i.value.published ? "Publishing" : "Publish"), 1)
          ])) : x("", !0),
          i.value.uuid ? (s(), n("button", {
            key: 2,
            type: "button",
            class: "rg-btn",
            onClick: T[5] || (T[5] = (V) => c.value = { copy: !0 })
          }, [
            E(F, {
              name: "copy",
              small: ""
            }),
            T[35] || (T[35] = N(" Save a copy", -1))
          ])) : x("", !0),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            disabled: !R(o).runnable.value || R(o).state.saving || i.value.uuid && !i.value.canEdit,
            onClick: T[6] || (T[6] = (V) => c.value = { copy: !1 })
          }, [
            E(F, {
              name: "save",
              small: ""
            }),
            T[36] || (T[36] = N(" Save ", -1))
          ], 8, qd)
        ])
      ]),
      R(o).state.loading ? (s(), n("div", Id, [
        e("aside", Ud, [
          e("div", jd, [
            (s(), n(U, null, H(8, (V) => e("div", {
              key: V,
              class: "rg-skeleton"
            })), 64))
          ])
        ]),
        T[38] || (T[38] = e("main", { class: "rg-builder__main" }, null, -1))
      ])) : (s(), n("div", zd, [
        e("aside", Bd, [
          e("div", Gd, [
            e("label", Kd, [
              T[39] || (T[39] = e("span", { class: "rg-sr-only" }, "Search reports", -1)),
              E(F, { name: "search" }),
              se(e("input", {
                "onUpdate:modelValue": T[7] || (T[7] = (V) => r.value = V),
                class: "rg-input",
                type: "search",
                placeholder: "Search reports",
                autocomplete: "off"
              }, null, 512), [
                [ce, r.value]
              ])
            ])
          ]),
          e("div", Hd, [
            R(o).state.reports.length ? x("", !0) : (s(), n("p", Wd, "No existing reports can be combined yet.")),
            (s(!0), n(U, null, H(v.value, ([V, re]) => (s(), n("section", {
              key: V,
              class: "rg-catalog__group"
            }, [
              e("h3", null, y(V), 1),
              (s(!0), n(U, null, H(re, (ie) => (s(), n("article", {
                key: ie.key,
                class: ne(["rg-catalog__report", { "is-open": a.value.has(ie.key), "is-used": w.value.has(ie.key), "is-off": !_(ie) }])
              }, [
                e("button", {
                  type: "button",
                  class: "rg-catalog__head",
                  "aria-expanded": a.value.has(ie.key),
                  disabled: !_(ie),
                  onClick: (fe) => S(ie)
                }, [
                  E(F, {
                    name: "chevron",
                    small: "",
                    class: "rg-catalog__chev"
                  }),
                  e("span", null, [
                    e("b", null, y(ie.label), 1),
                    _(ie) ? ie.description ? (s(), n("small", Zd, y(ie.description), 1)) : x("", !0) : (s(), n("small", Jd, "Per " + y(ie.levels.join(" / ")) + " only", 1))
                  ]),
                  w.value.has(ie.key) ? (s(), n("span", Qd, "in use")) : x("", !0)
                ], 8, Yd),
                E(it, { name: "rg-swap" }, {
                  default: de(() => {
                    var fe, Je, Te;
                    return [
                      a.value.has(ie.key) ? (s(), n("ul", Xd, [
                        (fe = R(o).fieldsOf(ie.key)) != null && fe.loading ? (s(), n("li", ec, [
                          E(F, {
                            name: "loader",
                            spin: "",
                            small: ""
                          }),
                          T[40] || (T[40] = N(" Reading its columns…", -1))
                        ])) : (Je = R(o).fieldsOf(ie.key)) != null && Je.error ? (s(), n("li", tc, y(R(o).fieldsOf(ie.key).error), 1)) : x("", !0),
                        (s(!0), n(U, null, H(((Te = R(o).fieldsOf(ie.key)) == null ? void 0 : Te.fields) ?? [], (xe) => (s(), n("li", {
                          key: xe.key
                        }, [
                          e("label", null, [
                            e("input", {
                              type: "checkbox",
                              class: "rg-check",
                              checked: R(o).hasField(ie.key, xe.key),
                              onChange: (Ze) => R(o).toggleField(ie.key, xe)
                            }, null, 40, sc),
                            E(F, {
                              name: M[xe.type] ?? "text",
                              small: ""
                            }, null, 8, ["name"]),
                            e("span", null, y(xe.label), 1),
                            xe.type === "percent" ? (s(), n("small", lc, "%")) : x("", !0)
                          ])
                        ]))), 128))
                      ])) : x("", !0)
                    ];
                  }),
                  _: 2
                }, 1024)
              ], 2))), 128))
            ]))), 128))
          ])
        ]),
        e("main", nc, [
          e("div", ac, [
            e("div", oc, [
              e("button", {
                type: "button",
                "aria-pressed": i.value.level === "employee",
                onClick: T[8] || (T[8] = (V) => i.value.level = "employee")
              }, "Per employee", 8, rc),
              e("button", {
                type: "button",
                "aria-pressed": i.value.level === "division",
                onClick: T[9] || (T[9] = (V) => i.value.level = "division")
              }, "Per division", 8, ic)
            ]),
            e("label", uc, [
              E(F, {
                name: "calendar",
                small: ""
              }),
              T[42] || (T[42] = N(" Period ", -1)),
              se(e("select", {
                id: "rg-combined-period",
                "onUpdate:modelValue": T[10] || (T[10] = (V) => i.value.period = V),
                class: "rg-input",
                style: { width: "auto" }
              }, [
                (s(), n(U, null, H(m, ([V, re]) => e("option", {
                  key: V,
                  value: V
                }, y(re), 9, dc)), 64)),
                T[41] || (T[41] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 512), [
                [Pe, i.value.period]
              ])
            ]),
            i.value.period === "custom" ? (s(), n(U, { key: 0 }, [
              se(e("input", {
                "onUpdate:modelValue": T[11] || (T[11] = (V) => i.value.from = V),
                class: "rg-input",
                type: "date",
                "aria-label": "From",
                style: { width: "auto" }
              }, null, 512), [
                [ce, i.value.from]
              ]),
              T[43] || (T[43] = e("span", { class: "rg-faint" }, "to", -1)),
              se(e("input", {
                "onUpdate:modelValue": T[12] || (T[12] = (V) => i.value.to = V),
                class: "rg-input",
                type: "date",
                "aria-label": "To",
                style: { width: "auto" }
              }, null, 512), [
                [ce, i.value.to]
              ])
            ], 64)) : x("", !0),
            e("div", cc, [
              E(F, {
                name: "folder",
                small: ""
              }),
              T[44] || (T[44] = N(" Lines ", -1)),
              E(Ye, {
                modelValue: i.value.lines,
                "onUpdate:modelValue": T[13] || (T[13] = (V) => i.value.lines = V),
                label: "Lines",
                "all-label": "All my lines",
                load: q
              }, null, 8, ["modelValue"])
            ])
          ]),
          e("div", gc, [
            e("div", mc, [
              (s(!0), n(U, null, H(R(rs), (V) => (s(), n("button", {
                key: V.key,
                type: "button",
                class: "rg-chip-toggle",
                "aria-pressed": i.value.fields.some((re) => re.base === V.key),
                onClick: (re) => R(o).toggleBase(V.key)
              }, y(V.label), 9, pc))), 128))
            ]),
            E(lt, {
              tag: "ol",
              name: "rg-list-move",
              class: "rg-combined__chips",
              "aria-label": "Columns"
            }, {
              default: de(() => [
                (s(!0), n(U, null, H(i.value.fields, (V, re) => {
                  var ie;
                  return s(), n("li", {
                    key: V.uid,
                    class: ne(["rg-combined__chip", { "is-formula": V.formula, "is-base": V.base, "is-dragging": p.value === V.uid }]),
                    draggable: "true",
                    onDragstart: (fe) => p.value = V.uid,
                    onDragend: T[16] || (T[16] = (fe) => p.value = null),
                    onDragover: T[17] || (T[17] = ge(() => {
                    }, ["prevent"])),
                    onDrop: ge((fe) => pe(V.uid), ["prevent"])
                  }, [
                    T[45] || (T[45] = e("span", {
                      class: "rg-combined__grip",
                      "aria-hidden": "true"
                    }, "⋮⋮", -1)),
                    e("span", fc, [
                      ((ie = h.value) == null ? void 0 : ie.uid) === V.uid ? se((s(), n("input", {
                        key: 0,
                        "onUpdate:modelValue": T[14] || (T[14] = (fe) => h.value.label = fe),
                        class: "rg-input rg-combined__rename",
                        "aria-label": `Rename ${V.label ?? V.as}`,
                        onKeydown: [
                          Ie(ge(W, ["prevent"]), ["enter"]),
                          T[15] || (T[15] = Ie((fe) => h.value = null, ["escape"]))
                        ],
                        onBlur: W
                      }, null, 40, bc)), [
                        [ce, h.value.label]
                      ]) : (s(), n("button", {
                        key: 1,
                        type: "button",
                        class: "rg-linkish",
                        title: "Rename",
                        onClick: (fe) => X(V)
                      }, y(V.label ?? V.as), 9, hc)),
                      e("small", yc, [
                        V.formula ? (s(), n(U, { key: 0 }, [
                          E(F, {
                            name: "fx",
                            small: ""
                          }),
                          N(" " + y(V.formula), 1)
                        ], 64)) : (s(), n(U, { key: 1 }, [
                          N(y($(V)), 1)
                        ], 64))
                      ])
                    ]),
                    V.formula ? (s(), n("button", {
                      key: 0,
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Edit ${V.label}`,
                      onClick: (fe) => C.value = { uid: V.uid, label: V.label, formula: V.formula }
                    }, [
                      E(F, {
                        name: "fx",
                        small: ""
                      })
                    ], 8, $c)) : x("", !0),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${V.label ?? V.as} left`,
                      disabled: re === 0,
                      onClick: (fe) => R(o).moveColumn(V.uid, re - 1)
                    }, "‹", 8, _c),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Remove ${V.label ?? V.as}`,
                      onClick: (fe) => R(o).removeColumn(V.uid)
                    }, [
                      E(F, {
                        name: "x",
                        small: ""
                      })
                    ], 8, kc)
                  ], 42, vc);
                }), 128))
              ]),
              _: 1
            }),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm",
              disabled: i.value.fields.length < 2,
              onClick: T[18] || (T[18] = (V) => C.value = { label: "", formula: "" })
            }, [
              E(F, {
                name: "fx",
                small: ""
              }),
              T[46] || (T[46] = N(" Formula ", -1))
            ], 8, wc)
          ]),
          e("section", xc, [
            e("div", Cc, [
              R(o).state.running ? (s(), n("span", Sc, [
                E(F, {
                  name: "loader",
                  spin: "",
                  small: ""
                }),
                T[47] || (T[47] = N(" Running the reports…", -1))
              ])) : R(o).state.meta && !R(o).state.error ? (s(), n(U, { key: 1 }, [
                e("span", null, y(w.value.size) + " " + y(w.value.size === 1 ? "report" : "reports") + " combined", 1),
                e("span", Mc, y(R(o).state.meta.duration_ms) + " ms", 1),
                R(o).state.meta.cached ? (s(), n("span", Tc, "from cache")) : x("", !0)
              ], 64)) : R(o).runnable.value ? x("", !0) : (s(), n("span", Ec, "Open a report on the left and tick the columns you want."))
            ]),
            e("div", null, [
              R(o).state.error ? (s(), n("div", Oc, [
                e("span", Rc, [
                  E(F, {
                    name: "alert",
                    small: ""
                  }),
                  N(y(D[R(o).state.error.code] ?? "This report cannot run yet"), 1)
                ]),
                e("span", null, y(R(o).state.error.message), 1)
              ])) : x("", !0)
            ]),
            E(Ot)
          ])
        ])
      ])),
      C.value ? (s(), ae(ze, {
        key: 2,
        title: C.value.uid ? "Edit formula" : "New formula",
        "data-rg-theme": t.theme,
        onClose: T[22] || (T[22] = (V) => C.value = null)
      }, {
        footer: de(() => {
          var V;
          return [
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: T[21] || (T[21] = (re) => C.value = null)
            }, "Cancel"),
            e("button", {
              type: "submit",
              form: "rg-combined-formula",
              class: "rg-btn rg-btn--primary",
              disabled: !((V = C.value.formula) != null && V.trim())
            }, y(C.value.uid ? "Update" : "Add"), 9, Pc)
          ];
        }),
        default: de(() => [
          e("form", {
            id: "rg-combined-formula",
            class: "rg-publish",
            onSubmit: ge(z, ["prevent"])
          }, [
            e("label", Dc, [
              T[48] || (T[48] = e("span", null, "Column name", -1)),
              se(e("input", {
                id: "rg-combined-formula-label",
                "onUpdate:modelValue": T[19] || (T[19] = (V) => C.value.label = V),
                class: "rg-input",
                maxlength: "120",
                placeholder: "Sales per visit"
              }, null, 512), [
                [ce, C.value.label]
              ])
            ]),
            e("label", Ac, [
              T[49] || (T[49] = e("span", null, "Formula", -1)),
              se(e("textarea", {
                id: "rg-combined-formula-text",
                "onUpdate:modelValue": T[20] || (T[20] = (V) => C.value.formula = V),
                class: "rg-textarea rg-formula",
                placeholder: "ROUND(sales / visits, 2)",
                required: ""
              }, null, 512), [
                [ce, C.value.formula]
              ])
            ]),
            e("div", Lc, [
              T[50] || (T[50] = e("span", null, "Columns you can use", -1)),
              e("div", Nc, [
                (s(!0), n(U, null, H(O.value.filter((V) => V.uid !== C.value.uid), (V) => (s(), n("button", {
                  key: V.as,
                  type: "button",
                  class: "rg-chip-toggle",
                  title: V.label,
                  onClick: (re) => B(V.as)
                }, y(V.as), 9, Vc))), 128))
              ]),
              T[51] || (T[51] = e("small", { class: "rg-faint" }, "+ − * / %, comparisons, IF, ROUND, ABS, COALESCE, NULLIF, GREATEST, LEAST, SAFE_DIVIDE. Dividing by zero gives an empty cell.", -1))
            ])
          ], 32)
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : x("", !0),
      d.value && i.value.uuid ? (s(), ae(At, {
        key: 3,
        report: i.value.uuid,
        "report-name": i.value.name,
        onClose: T[23] || (T[23] = (V) => d.value = !1),
        onOpenDashboard: T[24] || (T[24] = (V) => {
          d.value = !1, g("open-dashboard", V);
        })
      }, null, 8, ["report", "report-name"])) : x("", !0),
      c.value ? (s(), ae(os, {
        key: 4,
        copy: c.value.copy,
        onClose: T[25] || (T[25] = (V) => c.value = null),
        onSaved: L
      }, null, 8, ["copy"])) : x("", !0),
      k.value ? (s(), ae(Rt, {
        key: 5,
        uuid: i.value.uuid,
        name: i.value.name,
        onClose: T[26] || (T[26] = (V) => k.value = !1),
        onPublished: T[27] || (T[27] = (V) => {
          i.value.published = !0, g("published", V);
        }),
        onUnpublished: T[28] || (T[28] = (V) => {
          i.value.published = !1, g("published", V);
        })
      }, null, 8, ["uuid", "name"])) : x("", !0),
      E(bt, {
        toasts: R(f),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, Od));
  }
}, qc = {
  class: "rg-muted",
  style: { margin: "0" }
}, Ic = ["onClick"], Uc = {
  key: 0,
  class: "rg-badge rg-badge--warning"
}, jc = {
  __name: "PathDialog",
  setup(t) {
    const u = ye(Ee), l = ye("rg-theme", "light");
    return (g, d) => R(u).state.pathChoice ? (s(), ae(ze, {
      key: 0,
      title: `How should ${R(u).state.pathChoice.dataset.label} connect to this report?`,
      "data-rg-theme": R(l),
      onClose: d[1] || (d[1] = (b) => R(u).state.pathChoice = null)
    }, {
      footer: de(() => [
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: d[0] || (d[0] = (b) => R(u).state.pathChoice = null)
        }, "Cancel")
      ]),
      default: de(() => [
        e("p", qc, y(R(u).state.pathChoice.dataset.label) + " can be reached in more than one way, and each gives different numbers. ", 1),
        (s(!0), n(U, null, H(R(u).state.pathChoice.options, (b) => (s(), n("button", {
          key: b.path.join("."),
          type: "button",
          class: "rg-path-option",
          onClick: (f) => R(u).choosePath(b.path)
        }, [
          e("b", null, y(b.description), 1),
          b.multiplies_rows ? (s(), n("span", Uc, "several per report row")) : x("", !0)
        ], 8, Ic))), 128))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"])) : x("", !0);
  }
}, zc = ["data-rg-theme"], Bc = {
  key: 0,
  class: "rg-builder__body"
}, Gc = { class: "rg-explorer" }, Kc = { class: "rg-skeleton-list" }, Hc = {
  key: 1,
  class: "rg-main"
}, Wc = {
  key: 2,
  class: "rg-builder__body"
}, Yc = { class: "rg-builder__main" }, Jc = { class: "rg-shelves" }, Zc = { class: "rg-shelf" }, Qc = {
  key: 1,
  class: "rg-shelf__empty"
}, Xc = {
  key: 2,
  style: { "margin-top": "6px" }
}, eg = { class: "rg-shelf" }, tg = {
  class: "rg-panel__controls",
  style: { gap: "16px", "padding-top": "4px" }
}, sg = {
  class: "rg-field-inline",
  for: "rg-opt-grouped",
  title: "Show rows as groups you open one level at a time"
}, lg = ["disabled"], ng = {
  class: "rg-field-inline",
  for: "rg-opt-subtotals"
}, ag = ["disabled"], hp = {
  __name: "ReportBuilder",
  props: {
    /** uuid of a saved report to open; null starts a new one */
    reportId: { type: String, default: null },
    theme: { type: String, default: "light" }
  },
  emits: ["saved", "published", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = t, g = u, d = K(!1), { api: b } = Le(), f = ft(), o = Ql(b, f);
    Re(Ee, o), Re("rg-theme", l.theme);
    const m = K(null), M = K(null), i = K(!1), r = K(null), a = K(null), c = K(!1);
    Re("rg-start-combined", c), Re("rg-choose-combined", () => {
      a.value = null, r.value = "combined";
    });
    const k = K([]), C = K(!1);
    async function h(O) {
      var _;
      if (r.value = null, a.value = null, O)
        try {
          const S = await b.reports.get(O);
          if (((_ = S.definition) == null ? void 0 : _.type) === "combined") {
            a.value = S, r.value = "combined";
            return;
          }
        } catch {
        }
      r.value = "topic", await o.init(O);
    }
    he(() => l.reportId, (O) => h(O), { immediate: !1 }), Se(async () => {
      b.combine.reports().then((O) => c.value = O.length > 0).catch(() => {
      }), await h(l.reportId), document.addEventListener("keydown", p), b.reports.list({ scope: "mine" }).then((O) => k.value = O.folders ?? []).catch(() => {
      });
    }), Ne(() => {
      document.removeEventListener("keydown", p), o.cancelRunning();
    });
    function p(O) {
      var $;
      if (!(O.ctrlKey || O.metaKey)) return;
      const S = ["INPUT", "TEXTAREA", "SELECT"].includes(($ = document.activeElement) == null ? void 0 : $.tagName);
      O.key === "s" ? (O.preventDefault(), o.runnable.value && (M.value = { copy: !1 })) : O.key === "Enter" ? (O.preventDefault(), o.run()) : O.key.toLowerCase() === "z" && !S && (O.preventDefault(), O.shiftKey ? o.redo() : o.undo());
    }
    function v(O) {
      C.value = !1;
      try {
        const _ = JSON.parse(O.dataTransfer.getData("application/x-rg"));
        _.kind === "field" && o.addField(_.dataset, _.field, "filters"), _.kind === "item" && o.filterOnTotal(_.uid);
      } catch {
      }
    }
    function w(O) {
      g("saved", O);
    }
    return (O, _) => {
      var S;
      return r.value === "combined" ? (s(), ae(Fc, {
        key: ((S = a.value) == null ? void 0 : S.uuid) ?? "new",
        report: a.value,
        theme: t.theme,
        onSaved: w,
        onPublished: _[0] || (_[0] = ($) => g("published", $)),
        onOpenDashboard: _[1] || (_[1] = ($) => g("open-dashboard", $)),
        onBack: _[2] || (_[2] = ($) => {
          r.value = "topic", R(o).init(null);
        })
      }, null, 8, ["report", "theme"])) : (s(), n("div", {
        key: 1,
        class: "rg-root rg-builder",
        "data-rg-theme": t.theme
      }, [
        E(fn, {
          onSave: _[3] || (_[3] = ($) => M.value = { copy: !1 }),
          onSaveCopy: _[4] || (_[4] = ($) => M.value = { copy: !0 }),
          onPublish: _[5] || (_[5] = ($) => i.value = !0),
          onPin: _[6] || (_[6] = ($) => d.value = !0)
        }),
        R(o).state.loading ? (s(), n("div", Bc, [
          e("aside", Gc, [
            e("div", Kc, [
              (s(), n(U, null, H(10, ($) => e("div", {
                key: $,
                class: "rg-skeleton"
              })), 64))
            ])
          ]),
          _[21] || (_[21] = e("main", { class: "rg-builder__main" }, null, -1))
        ])) : R(o).state.draft.root ? (s(), n("div", Wc, [
          E(Yn),
          e("main", Yc, [
            e("div", Jc, [
              E(Ht, {
                shelf: "rows",
                title: "Rows",
                empty: "Drop fields to group by (lines, reps, months…)"
              }),
              E(Ht, {
                shelf: "values",
                title: "Values",
                empty: "Drop numbers to total (amounts, number of visits…)",
                onEditFormula: _[8] || (_[8] = ($) => m.value = { item: $ })
              }, {
                default: de(() => [
                  e("button", {
                    type: "button",
                    class: "rg-btn rg-btn--sm rg-btn--ghost",
                    onClick: _[7] || (_[7] = ($) => m.value = { item: null })
                  }, [
                    E(F, {
                      name: "fx",
                      small: ""
                    }),
                    _[22] || (_[22] = N(" Formula ", -1))
                  ])
                ]),
                _: 1
              }),
              e("div", Zc, [
                _[23] || (_[23] = e("span", { class: "rg-shelf__title" }, "Filters", -1)),
                e("div", {
                  class: ne(["rg-shelf__drop", { "rg-shelf__drop--over": C.value }]),
                  style: { display: "block" },
                  "aria-label": "Filters shelf",
                  onDragover: _[10] || (_[10] = ($) => [...$.dataTransfer.types].includes("application/x-rg") && ($.preventDefault(), C.value = !0)),
                  onDragleave: _[11] || (_[11] = ge(($) => C.value = !1, ["self"])),
                  onDrop: ge(v, ["prevent"])
                }, [
                  R(o).state.draft.filters.items.length ? (s(), ae(Ba, {
                    key: 0,
                    group: R(o).state.draft.filters
                  }, null, 8, ["group"])) : (s(), n("span", Qc, "Drop a field to filter the rows, or a value to filter totals")),
                  R(o).state.draft.filters.items.length ? (s(), n("div", Xc, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--sm rg-btn--ghost",
                      onClick: _[9] || (_[9] = ($) => R(o).addFilterGroup())
                    }, [
                      E(F, {
                        name: "plus",
                        small: ""
                      }),
                      N(" Add a group (" + y(R(o).state.draft.filters.boolean === "and" ? "any of" : "all of") + ") ", 1)
                    ])
                  ])) : x("", !0)
                ], 34)
              ]),
              e("div", eg, [
                _[26] || (_[26] = e("span", { class: "rg-shelf__title" }, "Options", -1)),
                e("div", tg, [
                  e("label", sg, [
                    se(e("input", {
                      id: "rg-opt-grouped",
                      "onUpdate:modelValue": _[12] || (_[12] = ($) => R(o).state.draft.grouped = $),
                      class: "rg-check",
                      type: "checkbox",
                      disabled: R(o).state.draft.rows.length < 2
                    }, null, 8, lg), [
                      [ot, R(o).state.draft.grouped]
                    ]),
                    _[24] || (_[24] = N(" Group rows (open level by level) ", -1))
                  ]),
                  e("label", ng, [
                    se(e("input", {
                      id: "rg-opt-subtotals",
                      "onUpdate:modelValue": _[13] || (_[13] = ($) => R(o).state.draft.subtotals = $),
                      class: "rg-check",
                      type: "checkbox",
                      disabled: !R(o).state.draft.values.length || R(o).grouped.value
                    }, null, 8, ag), [
                      [ot, R(o).state.draft.subtotals]
                    ]),
                    _[25] || (_[25] = N(" Subtotals ", -1))
                  ])
                ])
              ])
            ]),
            E(kr)
          ])
        ])) : (s(), n("main", Hc, [
          E(Mn)
        ])),
        m.value ? (s(), ae(Pr, {
          key: 3,
          item: m.value.item,
          onClose: _[14] || (_[14] = ($) => m.value = null)
        }, null, 8, ["item"])) : x("", !0),
        d.value && R(o).state.draft.uuid ? (s(), ae(At, {
          key: 4,
          report: R(o).state.draft.uuid,
          "report-name": R(o).state.draft.name,
          onClose: _[15] || (_[15] = ($) => d.value = !1),
          onOpenDashboard: _[16] || (_[16] = ($) => {
            d.value = !1, g("open-dashboard", $);
          })
        }, null, 8, ["report", "report-name"])) : x("", !0),
        i.value ? (s(), ae(Rt, {
          key: 5,
          uuid: R(o).state.draft.uuid,
          name: R(o).state.draft.name,
          onClose: _[17] || (_[17] = ($) => i.value = !1),
          onPublished: _[18] || (_[18] = ($) => {
            R(o).state.draft.published = !0, g("published", $);
          }),
          onUnpublished: _[19] || (_[19] = ($) => {
            R(o).state.draft.published = !1, g("published", $);
          })
        }, null, 8, ["uuid", "name"])) : x("", !0),
        M.value ? (s(), ae(os, {
          key: 6,
          copy: M.value.copy,
          folders: k.value,
          onClose: _[20] || (_[20] = ($) => M.value = null),
          onSaved: w
        }, null, 8, ["copy", "folders"])) : x("", !0),
        E(jc),
        E(bt, {
          toasts: R(f),
          "data-rg-theme": t.theme
        }, null, 8, ["toasts", "data-rg-theme"])
      ], 8, zc));
    };
  }
}, og = ["data-rg-theme"], rg = { class: "rg-topbar" }, ig = { class: "rg-topbar__actions" }, ug = { class: "rg-library__filters" }, dg = {
  class: "rg-tabs",
  role: "tablist"
}, cg = ["aria-selected", "onClick"], gg = {
  class: "rg-search",
  style: { width: "260px" }
}, mg = {
  key: 0,
  class: "rg-tabs",
  "aria-label": "Folders"
}, pg = ["aria-selected"], vg = ["aria-selected", "onClick"], fg = { class: "rg-library__list" }, bg = {
  key: 0,
  class: "rg-skeleton-list"
}, hg = {
  key: 1,
  class: "rg-empty"
}, yg = { class: "rg-empty__icon" }, $g = { class: "rg-report-row__title" }, _g = ["onClick"], kg = { class: "rg-report-row__meta" }, wg = { style: { display: "flex", gap: "6px", "align-items": "center" } }, xg = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, Cg = {
  key: 1,
  class: "rg-badge rg-badge--info"
}, Sg = { class: "rg-report-row__actions" }, Mg = ["aria-label", "onClick"], Tg = {
  key: 3,
  class: "rg-empty"
}, Eg = { class: "rg-empty__icon" }, Og = { class: "rg-report-row__title" }, Rg = ["onClick"], Dg = { class: "rg-report-row__meta" }, Ag = { key: 0 }, Lg = {
  key: 1,
  class: "rg-faint",
  style: { overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap", "max-width": "420px" }
}, Ng = { style: { display: "flex", gap: "6px", "align-items": "center" } }, Vg = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, Pg = {
  key: 1,
  class: "rg-badge rg-badge--info"
}, Fg = {
  key: 2,
  class: "rg-badge"
}, qg = { class: "rg-report-row__actions" }, Ig = ["onClick"], Ug = ["onClick"], jg = ["aria-label", "onClick"], yp = {
  __name: "ReportLibrary",
  props: { theme: { type: String, default: "light" } },
  emits: ["open", "create", "dashboard", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = u, { api: g } = Le(), d = ft(), b = K("all"), f = K(""), o = K(null), m = K([]), M = K([]), i = K(!0), r = K(null), a = [["all", "All"], ["mine", "Mine"], ["shared", "Shared with me"], ["dashboards", "Dashboards"]], c = K([]), k = G(() => b.value === "dashboards"), C = G(() => {
      const _ = f.value.trim().toLowerCase();
      return c.value.filter((S) => !_ || S.name.toLowerCase().includes(_));
    });
    let h = null;
    async function p() {
      if (i.value = !0, b.value === "dashboards") {
        try {
          c.value = await g.dashboards.list();
        } catch (_) {
          d.error(_);
        } finally {
          i.value = !1;
        }
        return;
      }
      try {
        const _ = await g.reports.list({ scope: b.value, search: f.value || void 0, folder: o.value || void 0 });
        m.value = _.data, o.value || (M.value = _.folders);
      } catch (_) {
        d.error(_);
      } finally {
        i.value = !1;
      }
    }
    he([b, o], p), he(f, () => {
      clearTimeout(h), h = setTimeout(p, 250);
    }), Se(p);
    async function v(_) {
      try {
        const S = await g.reports.duplicate(_.uuid);
        d.success(`Created "${S.name}".`), l("open", S.uuid);
      } catch (S) {
        d.error(S);
      }
    }
    async function w(_) {
      if (r.value = null, _.widgets_count !== void 0) {
        try {
          await g.dashboards.remove(_.uuid), c.value = c.value.filter((S) => S.uuid !== _.uuid), d.success(`Deleted "${_.name}".`);
        } catch (S) {
          d.error(S);
        }
        return;
      }
      try {
        await g.reports.remove(_.uuid), m.value = m.value.filter((S) => S.uuid !== _.uuid), d.success(`Deleted "${_.name}".`);
      } catch (S) {
        d.error(S);
      }
    }
    const O = G(() => !i.value && (k.value ? !C.value.length : !m.value.length));
    return (_, S) => (s(), n("div", {
      class: "rg-root rg-library",
      "data-rg-theme": t.theme
    }, [
      e("header", rg, [
        S[8] || (S[8] = e("div", { class: "rg-topbar__title" }, [
          e("h1", null, "Reports"),
          e("div", { class: "rg-topbar__meta" }, [
            e("span", null, "Build a report from any connected data, save it, and share it.")
          ])
        ], -1)),
        e("div", ig, [
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: S[0] || (S[0] = ($) => l("create"))
          }, [
            E(F, {
              name: "plus",
              small: ""
            }),
            S[7] || (S[7] = N(" New report", -1))
          ])
        ])
      ]),
      e("div", ug, [
        e("div", dg, [
          (s(), n(U, null, H(a, ([$, X]) => e("button", {
            key: $,
            type: "button",
            role: "tab",
            class: "rg-tab",
            "aria-selected": b.value === $ ? "true" : "false",
            onClick: (W) => b.value = $
          }, y(X), 9, cg)), 64))
        ]),
        e("label", gg, [
          S[9] || (S[9] = e("span", { class: "rg-sr-only" }, "Search reports", -1)),
          E(F, { name: "search" }),
          se(e("input", {
            id: "rg-library-search",
            "onUpdate:modelValue": S[1] || (S[1] = ($) => f.value = $),
            class: "rg-input",
            type: "search",
            placeholder: "Search reports",
            autocomplete: "off"
          }, null, 512), [
            [ce, f.value]
          ])
        ]),
        M.value.length && !k.value ? (s(), n("div", mg, [
          e("button", {
            type: "button",
            class: "rg-tab",
            "aria-selected": o.value ? "false" : "true",
            onClick: S[2] || (S[2] = ($) => o.value = null)
          }, "All folders", 8, pg),
          (s(!0), n(U, null, H(M.value, ($) => (s(), n("button", {
            key: $,
            type: "button",
            class: "rg-tab",
            "aria-selected": o.value === $ ? "true" : "false",
            onClick: (X) => o.value = $
          }, [
            E(F, {
              name: "folder",
              small: ""
            }),
            N(" " + y($), 1)
          ], 8, vg))), 128))
        ])) : x("", !0)
      ]),
      e("div", fg, [
        i.value ? (s(), n("div", bg, [
          (s(), n(U, null, H(5, ($) => e("div", {
            key: $,
            class: "rg-skeleton",
            style: { height: "44px" }
          })), 64))
        ])) : O.value && k.value ? (s(), n("div", hg, [
          e("div", yg, [
            E(F, { name: "view" })
          ]),
          e("h2", null, y(f.value ? "No dashboard matches" : "No dashboards yet"), 1),
          S[10] || (S[10] = e("p", null, [
            N("Open the Reports tab and press "),
            e("b", null, "Dashboard"),
            N(" on a report: its numbers become headline tiles and charts you can arrange.")
          ], -1))
        ])) : k.value ? (s(!0), n(U, { key: 2 }, H(C.value, ($) => (s(), n("article", {
          key: $.uuid,
          class: "rg-report-row"
        }, [
          e("div", $g, [
            e("button", {
              type: "button",
              onClick: (X) => l("open-dashboard", $.uuid)
            }, [
              E(F, {
                name: "view",
                small: ""
              }),
              N(" " + y($.name), 1)
            ], 8, _g),
            e("div", kg, [
              e("span", null, y($.widgets_count) + " widgets", 1),
              e("span", null, "Updated " + y(R(Kt)($.updated_at)), 1)
            ])
          ]),
          e("div", wg, [
            $.published ? (s(), n("span", xg, [
              E(F, {
                name: "globe",
                small: ""
              }),
              S[11] || (S[11] = N(" Published", -1))
            ])) : $.visibility === "public" ? (s(), n("span", Cg, [
              E(F, {
                name: "globe",
                small: ""
              }),
              S[12] || (S[12] = N(" Everyone", -1))
            ])) : x("", !0)
          ]),
          e("div", Sg, [
            $.is_owner ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost rg-btn--danger",
              "aria-label": `Delete ${$.name}`,
              onClick: (X) => r.value = $
            }, [
              E(F, {
                name: "trash",
                small: ""
              })
            ], 8, Mg)) : x("", !0)
          ])
        ]))), 128)) : O.value ? (s(), n("div", Tg, [
          e("div", Eg, [
            E(F, { name: "table" })
          ]),
          e("h2", null, y(f.value || o.value ? "No report matches" : b.value === "shared" ? "Nothing shared with you yet" : "No reports yet"), 1),
          e("p", null, y(f.value || o.value ? "Try another search or folder." : "Start one: pick what it is about, then drag in the fields you need."), 1),
          !f.value && !o.value ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: S[3] || (S[3] = ($) => l("create"))
          }, [
            E(F, {
              name: "plus",
              small: ""
            }),
            S[13] || (S[13] = N(" New report", -1))
          ])) : x("", !0)
        ])) : (s(!0), n(U, { key: 4 }, H(m.value, ($) => (s(), n("article", {
          key: $.uuid,
          class: "rg-report-row"
        }, [
          e("div", Og, [
            e("button", {
              type: "button",
              onClick: (X) => l("open", $.uuid)
            }, y($.name), 9, Rg),
            e("div", Dg, [
              $.folder ? (s(), n("span", Ag, [
                E(F, {
                  name: "folder",
                  small: ""
                }),
                N(" " + y($.folder), 1)
              ])) : x("", !0),
              e("span", null, y($.fields_count) + " fields", 1),
              e("span", null, "Updated " + y(R(Kt)($.updated_at)), 1),
              $.description ? (s(), n("span", Lg, y($.description), 1)) : x("", !0)
            ])
          ]),
          e("div", Ng, [
            $.visibility === "public" ? (s(), n("span", Vg, [
              E(F, {
                name: "globe",
                small: ""
              }),
              S[14] || (S[14] = N(" Everyone", -1))
            ])) : $.shared ? (s(), n("span", Pg, [
              E(F, {
                name: "users",
                small: ""
              }),
              S[15] || (S[15] = N(" Shared", -1))
            ])) : x("", !0),
            $.is_owner ? x("", !0) : (s(), n("span", Fg, y($.can_edit ? "Can edit" : "View only"), 1))
          ]),
          e("div", qg, [
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              title: "Make a dashboard from this report",
              onClick: (X) => l("dashboard", $.uuid)
            }, [
              E(F, {
                name: "view",
                small: ""
              }),
              S[16] || (S[16] = N(" Dashboard", -1))
            ], 8, Ig),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              onClick: (X) => v($)
            }, [
              E(F, {
                name: "copy",
                small: ""
              }),
              S[17] || (S[17] = N(" Duplicate", -1))
            ], 8, Ug),
            $.is_owner ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost rg-btn--danger",
              "aria-label": `Delete ${$.name}`,
              onClick: (X) => r.value = $
            }, [
              E(F, {
                name: "trash",
                small: ""
              })
            ], 8, jg)) : x("", !0)
          ])
        ]))), 128))
      ]),
      r.value ? (s(), ae(ze, {
        key: 0,
        title: `Delete “${r.value.name}”?`,
        "data-rg-theme": t.theme,
        onClose: S[6] || (S[6] = ($) => r.value = null)
      }, {
        footer: de(() => [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: S[4] || (S[4] = ($) => r.value = null)
          }, "Keep it"),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--danger",
            onClick: S[5] || (S[5] = ($) => w(r.value))
          }, "Delete")
        ]),
        default: de(() => [
          S[18] || (S[18] = e("p", { style: { margin: "0" } }, "People it is shared with will lose it too. This cannot be undone from here.", -1))
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : x("", !0),
      E(bt, {
        toasts: R(d),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, og));
  }
}, zg = ["data-rg-theme"], Bg = {
  key: 0,
  class: "rg-main"
}, Gg = { class: "rg-empty" }, Kg = { class: "rg-empty__icon" }, Hg = { class: "rg-topbar" }, Wg = { class: "rg-topbar__title" }, Yg = { key: 0 }, Jg = {
  key: 1,
  class: "rg-skeleton",
  style: { width: "220px", height: "18px" }
}, Zg = {
  key: 2,
  class: "rg-topbar__meta"
}, Qg = { class: "rg-topbar__actions" }, Xg = ["disabled"], em = {
  class: "rg-viewer__filter",
  for: "rg-viewer-period"
}, tm = ["value"], sm = {
  key: 0,
  class: "rg-viewer__range"
}, lm = {
  key: 0,
  class: "rg-viewer__filter"
}, nm = {
  key: 1,
  class: "rg-viewer__filter"
}, am = {
  key: 2,
  class: "rg-viewer__filter"
}, om = ["for"], rm = {
  key: 0,
  class: "rg-viewer__required"
}, im = ["id", "onUpdate:modelValue"], um = ["value"], dm = ["id", "onUpdate:modelValue", "type"], cm = ["disabled"], gm = {
  class: "rg-results",
  "aria-label": "Results"
}, mm = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, pm = { key: 0 }, vm = {
  key: 1,
  class: "rg-num"
}, fm = {
  key: 0,
  class: "rg-errorbox",
  role: "alert"
}, bm = { class: "rg-errorbox__title" }, Jt = 200, $p = {
  __name: "ReportViewer",
  props: {
    reportId: { type: String, required: !0 },
    theme: { type: String, default: "light" },
    /** Offer "Dashboard" (for people who can build dashboards). */
    dashboards: { type: Boolean, default: !1 }
  },
  emits: ["edit", "loaded", "dashboard", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = t, g = u, d = K(!1), b = [
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
    ], { api: f } = Le();
    Re("rg-theme", l.theme);
    const o = K(null), m = K(null), M = $e({ period: "", from: "", to: "", lines: [], divisions: [], employees: [], parameters: {} }), i = $e({ lines: !1, divisions: !1, employees: !1 }), r = $e({
      draft: { rows: [], values: [], sort: [] },
      runSeq: 0,
      running: !1,
      error: null,
      meta: null
    }), a = G(() => {
      var X;
      return !!((X = o.value) != null && X.grouped) && r.draft.rows.length >= 2;
    }), c = G(() => !!o.value);
    let k = null;
    function C() {
      return M.period === "custom" ? M.from && M.to ? [M.from, M.to] : null : M.period || null;
    }
    function h() {
      const X = {}, W = C();
      W && (X.period = W);
      for (const pe of ["lines", "divisions", "employees"])
        M[pe].length && (X[pe] = M[pe]);
      return Object.keys(X).length ? X : void 0;
    }
    const p = () => ({ parameters: M.parameters, context: h(), sort: r.draft.sort });
    function v(X) {
      return (W) => f.contextOptions(X, { search: W, lines: X === "lines" ? [] : M.lines, period: C() ?? void 0 });
    }
    async function w({ keys: X = [], offset: W = 0, top: pe = !1, size: z = Jt, fresh: B = !1 } = {}) {
      var D, A;
      const q = a.value ? { columns: r.draft.rows.map((T) => T.as), keys: X } : void 0, L = pe && (W === 0 || B);
      L && ((D = k == null ? void 0 : k.abort) == null || D.call(k), k = typeof AbortController < "u" ? new AbortController() : null, r.running = !0, r.error = null);
      try {
        const T = await f.reports.run(l.reportId, {
          ...p(),
          offset: W,
          size: z ?? Jt,
          groups: q,
          signal: k == null ? void 0 : k.signal
        });
        if (pe) {
          L && (r.meta = { ...T.meta, rows: T.rows.length, has_more: !!((A = T.page) != null && A.has_more) });
          const V = Object.fromEntries((T.columns ?? []).map((re) => [re.alias, re.label]));
          r.draft.rows.forEach((re) => {
            re.label = V[re.as] ?? re.label;
          });
        }
        return T;
      } catch (T) {
        throw pe && (r.error = T), T;
      } finally {
        L && (r.running = !1);
      }
    }
    function O() {
      r.runSeq++;
    }
    function _(X) {
      const W = r.draft.sort.find((pe) => pe.field === X);
      r.draft.sort = W ? W.dir === "asc" ? [{ field: X, dir: "desc" }] : [] : [{ field: X, dir: "asc" }], O();
    }
    Re(Ee, {
      state: r,
      grouped: a,
      runnable: c,
      fetchRows: w,
      toggleSort: _,
      fetchSummary: () => f.reports.summary(l.reportId, p()),
      exportReport: (X) => f.reports.export(l.reportId, X, p()),
      gridKey: G(() => `view:${l.reportId}`)
    });
    async function S() {
      var X, W, pe;
      m.value = null, o.value = null;
      try {
        const z = await f.reports.view(l.reportId), B = Object.fromEntries((z.fields ?? []).map((D) => [D.as, D])), q = z.grouped && ((X = z.rows) != null && X.length) ? z.rows : (z.fields ?? []).filter((D) => D.kind === "dimension").map((D) => D.as);
        r.draft.rows = q.map((D) => {
          var A, T;
          return { as: D, label: ((A = B[D]) == null ? void 0 : A.label) ?? D, kind: "dimension", grain: ((T = B[D]) == null ? void 0 : T.grain) ?? null };
        }), r.draft.values = (z.fields ?? []).filter((D) => !q.includes(D.as)).map((D) => ({ as: D.as, label: D.label ?? D.as, kind: D.kind, grain: D.grain ?? null })), r.draft.sort = z.sort ?? [];
        const L = ((W = z.context) == null ? void 0 : W.period) ?? null;
        Array.isArray(L) ? Object.assign(M, { period: "custom", from: String(L[0]).slice(0, 10), to: String(L[1]).slice(0, 10) }) : M.period = typeof L == "string" && !L.startsWith("{{") ? L : "", M.parameters = Object.fromEntries((z.parameters ?? []).map((D) => [D.key, D.default ?? ""]));
        for (const D of ["lines", "divisions", "employees"])
          M[D] = Array.isArray((pe = z.context) == null ? void 0 : pe[D]) ? [...z.context[D]] : [];
        o.value = z, g("loaded", z), O();
        for (const D of ["lines", "divisions", "employees"])
          f.contextOptions(D, { lines: [] }).then((A) => i[D] = A.length > 0).catch(() => i[D] = !1);
      } catch (z) {
        m.value = z;
      }
    }
    he(() => l.reportId, S), Se(S), Ne(() => {
      var X;
      return (X = k == null ? void 0 : k.abort) == null ? void 0 : X.call(k);
    });
    const $ = {
      MISSING_PARAMETER: "Choose a value to run this report",
      DATASET_FORBIDDEN: "No access",
      TIMEOUT: "The report took too long",
      TOO_HEAVY: "The report would read too much data",
      TOO_MANY_QUERIES: "Too many reports running",
      SERVER_BUSY: "The report server is busy"
    };
    return (X, W) => {
      var pe, z;
      return s(), n("div", {
        class: "rg-root rg-viewer",
        "data-rg-theme": t.theme
      }, [
        m.value ? (s(), n("div", Bg, [
          e("div", Gg, [
            e("div", Kg, [
              E(F, {
                name: m.value.status === 403 ? "lock" : "alert"
              }, null, 8, ["name"])
            ]),
            e("h2", null, y(m.value.status === 403 ? "You cannot open this report" : m.value.status === 404 ? "This report no longer exists" : "The report could not be opened"), 1),
            e("p", null, y(m.value.message), 1),
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: S
            }, "Try again")
          ])
        ])) : (s(), n(U, { key: 1 }, [
          e("header", Hg, [
            e("div", Wg, [
              o.value ? (s(), n("h1", Yg, y(o.value.name), 1)) : (s(), n("div", Jg)),
              (pe = o.value) != null && pe.description ? (s(), n("div", Zg, [
                e("span", null, y(o.value.description), 1)
              ])) : x("", !0)
            ]),
            e("div", Qg, [
              (z = o.value) != null && z.can_edit ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn",
                onClick: W[0] || (W[0] = (B) => g("edit", o.value.uuid))
              }, [
                E(F, {
                  name: "fx",
                  small: ""
                }),
                W[12] || (W[12] = N(" Edit", -1))
              ])) : x("", !0),
              o.value && t.dashboards ? (s(), n("button", {
                key: 1,
                type: "button",
                class: "rg-btn",
                title: "Add a chart or number from this report to a dashboard",
                onClick: W[1] || (W[1] = (B) => d.value = !0)
              }, [
                E(F, {
                  name: "plus",
                  small: ""
                }),
                W[13] || (W[13] = N(" Pin to dashboard", -1))
              ])) : x("", !0),
              o.value && t.dashboards ? (s(), n("button", {
                key: 2,
                type: "button",
                class: "rg-btn",
                title: "Make a dashboard from this report",
                onClick: W[2] || (W[2] = (B) => g("dashboard", o.value.uuid))
              }, [
                E(F, {
                  name: "view",
                  small: ""
                }),
                W[14] || (W[14] = N(" Dashboard", -1))
              ])) : x("", !0),
              e("button", {
                type: "button",
                class: "rg-btn rg-btn--primary",
                disabled: !o.value || r.running,
                onClick: O
              }, [
                E(F, {
                  name: "play",
                  small: ""
                }),
                W[15] || (W[15] = N(" Refresh", -1))
              ], 8, Xg)
            ])
          ]),
          o.value ? (s(), n("form", {
            key: 0,
            class: "rg-viewer__filters",
            onSubmit: ge(O, ["prevent"])
          }, [
            e("label", em, [
              e("span", null, [
                E(F, {
                  name: "calendar",
                  small: ""
                }),
                W[16] || (W[16] = N(" Period", -1))
              ]),
              se(e("select", {
                id: "rg-viewer-period",
                "onUpdate:modelValue": W[3] || (W[3] = (B) => M.period = B),
                class: "rg-input",
                onChange: W[4] || (W[4] = (B) => M.period !== "custom" && O())
              }, [
                W[17] || (W[17] = e("option", { value: "" }, "All dates", -1)),
                (s(), n(U, null, H(b, ([B, q]) => e("option", {
                  key: B,
                  value: B
                }, y(q), 9, tm)), 64)),
                W[18] || (W[18] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 544), [
                [Pe, M.period]
              ])
            ]),
            E(it, { name: "rg-swap" }, {
              default: de(() => [
                M.period === "custom" ? (s(), n("div", sm, [
                  se(e("input", {
                    "onUpdate:modelValue": W[5] || (W[5] = (B) => M.from = B),
                    class: "rg-input",
                    type: "date",
                    "aria-label": "From",
                    required: ""
                  }, null, 512), [
                    [ce, M.from]
                  ]),
                  W[19] || (W[19] = e("span", { class: "rg-faint" }, "to", -1)),
                  se(e("input", {
                    "onUpdate:modelValue": W[6] || (W[6] = (B) => M.to = B),
                    class: "rg-input",
                    type: "date",
                    "aria-label": "To",
                    required: ""
                  }, null, 512), [
                    [ce, M.to]
                  ])
                ])) : x("", !0)
              ]),
              _: 1
            }),
            i.lines ? (s(), n("div", lm, [
              e("span", null, [
                E(F, {
                  name: "folder",
                  small: ""
                }),
                W[20] || (W[20] = N(" Lines", -1))
              ]),
              E(Ye, {
                modelValue: M.lines,
                "onUpdate:modelValue": W[7] || (W[7] = (B) => M.lines = B),
                label: "Lines",
                "all-label": "All my lines",
                load: v("lines"),
                onChange: O
              }, null, 8, ["modelValue", "load"])
            ])) : x("", !0),
            i.divisions ? (s(), n("div", nm, [
              e("span", null, [
                E(F, {
                  name: "users",
                  small: ""
                }),
                W[21] || (W[21] = N(" Divisions", -1))
              ]),
              E(Ye, {
                modelValue: M.divisions,
                "onUpdate:modelValue": W[8] || (W[8] = (B) => M.divisions = B),
                label: "Divisions",
                "all-label": "All my divisions",
                load: v("divisions"),
                "depends-on": M.lines,
                onChange: O
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : x("", !0),
            i.employees ? (s(), n("div", am, [
              e("span", null, [
                E(F, {
                  name: "users",
                  small: ""
                }),
                W[22] || (W[22] = N(" Employees", -1))
              ]),
              E(Ye, {
                modelValue: M.employees,
                "onUpdate:modelValue": W[9] || (W[9] = (B) => M.employees = B),
                label: "Employees",
                "all-label": "All my employees",
                load: v("employees"),
                "depends-on": M.lines,
                onChange: O
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : x("", !0),
            (s(!0), n(U, null, H(o.value.parameters, (B) => (s(), n("label", {
              key: B.key,
              class: "rg-viewer__filter",
              for: `rg-viewer-p-${B.key}`
            }, [
              e("span", null, [
                N(y(B.label ?? B.key), 1),
                B.required ? (s(), n("b", rm, "*")) : x("", !0)
              ]),
              B.type === "date_range" ? se((s(), n("select", {
                key: 0,
                id: `rg-viewer-p-${B.key}`,
                "onUpdate:modelValue": (q) => M.parameters[B.key] = q,
                class: "rg-input"
              }, [
                (s(), n(U, null, H(b, ([q, L]) => e("option", {
                  key: q,
                  value: q
                }, y(L), 9, um)), 64))
              ], 8, im)), [
                [Pe, M.parameters[B.key]]
              ]) : se((s(), n("input", {
                key: 1,
                id: `rg-viewer-p-${B.key}`,
                "onUpdate:modelValue": (q) => M.parameters[B.key] = q,
                class: "rg-input",
                type: B.type === "number" ? "number" : "text"
              }, null, 8, dm)), [
                [ys, M.parameters[B.key]]
              ])
            ], 8, om))), 128)),
            e("button", {
              type: "submit",
              class: "rg-btn",
              disabled: r.running
            }, "Apply", 8, cm)
          ], 32)) : x("", !0),
          e("section", gm, [
            e("div", mm, [
              r.running ? (s(), n("span", pm, [
                E(F, {
                  name: "loader",
                  spin: "",
                  small: ""
                }),
                W[23] || (W[23] = N(" Running…", -1))
              ])) : r.meta ? (s(), n("span", vm, [
                N(y(r.meta.has_more ? `${R(je)(r.meta.rows ?? 0)}+ rows` : `${R(je)(r.meta.rows ?? 0)} rows`) + " ", 1),
                r.meta.duration_ms != null ? (s(), n(U, { key: 0 }, [
                  N(" · " + y(r.meta.duration_ms) + " ms", 1)
                ], 64)) : x("", !0)
              ])) : x("", !0)
            ]),
            r.error ? (s(), n("div", fm, [
              e("span", bm, [
                E(F, {
                  name: "alert",
                  small: ""
                }),
                N(y($[r.error.code] ?? "The report could not run"), 1)
              ]),
              e("span", null, y(r.error.message), 1)
            ])) : x("", !0),
            o.value ? (s(), ae(Ot, { key: 1 })) : x("", !0)
          ])
        ], 64)),
        d.value && o.value ? (s(), ae(At, {
          key: 2,
          report: o.value.uuid,
          "report-name": o.value.name,
          onClose: W[10] || (W[10] = (B) => d.value = !1),
          onOpenDashboard: W[11] || (W[11] = (B) => {
            d.value = !1, g("open-dashboard", B);
          })
        }, null, 8, ["report", "report-name"])) : x("", !0)
      ], 8, zg);
    };
  }
}, ps = [
  ["this_month", "This month"],
  ["last_month", "Last month"],
  ["this_quarter", "This quarter"],
  ["last_quarter", "Last quarter"],
  ["this_year", "This year"],
  ["last_year", "Last year"],
  ["last_30_days", "Last 30 days"]
];
function vs(t = 3) {
  let u = 0;
  const l = [];
  function g() {
    if (u >= t || l.length === 0) return;
    const { task: d, resolve: b, reject: f } = l.shift();
    u++, Promise.resolve().then(d).then(b, f).finally(() => {
      u--, g();
    });
  }
  return function(b) {
    return new Promise((f, o) => {
      l.push({ task: b, resolve: f, reject: o }), g();
    });
  };
}
const hm = ["data-rg-theme"], ym = {
  key: 0,
  class: "rg-main"
}, $m = { class: "rg-empty" }, _m = { class: "rg-empty__icon" }, km = { class: "rg-topbar" }, wm = { class: "rg-topbar__title" }, xm = { key: 0 }, Cm = {
  key: 1,
  class: "rg-skeleton",
  style: { width: "220px", height: "18px" }
}, Sm = {
  key: 2,
  class: "rg-topbar__meta"
}, Mm = { class: "rg-topbar__actions" }, Tm = ["disabled"], Em = {
  class: "rg-viewer__filter",
  for: "rg-dash-period"
}, Om = ["value"], Rm = {
  key: 0,
  class: "rg-viewer__range"
}, Dm = {
  key: 1,
  class: "rg-viewer__filter"
}, Am = {
  key: 2,
  class: "rg-viewer__filter"
}, Lm = {
  key: 3,
  class: "rg-viewer__filter"
}, Nm = { class: "rg-dashboard__body" }, Vm = {
  key: 0,
  class: "rg-dashboard__grid"
}, Pm = { class: "rg-widget__skeleton" }, Fm = {
  key: 1,
  class: "rg-dashboard__grid"
}, qm = {
  key: 0,
  class: "rg-faint"
}, _p = {
  __name: "DashboardView",
  props: {
    dashboardId: { type: String, required: !0 },
    theme: { type: String, default: "light" }
  },
  emits: ["edit", "loaded"],
  setup(t, { emit: u }) {
    const l = t, g = u, { api: d } = Le();
    Re("rg-theme", l.theme), Re("rg-widget-queue", vs(3));
    const b = K(null), f = K(null), o = K(0), m = $e({ period: "", from: "", to: "", lines: [], divisions: [], employees: [] }), M = $e({ lines: !1, divisions: !1, employees: !1 });
    function i() {
      const C = {}, h = m.period === "custom" ? m.from && m.to ? [m.from, m.to] : null : m.period || null;
      h && (C.period = h);
      for (const p of ["lines", "divisions", "employees"]) m[p].length && (C[p] = m[p]);
      return C;
    }
    function r(C) {
      return () => d.dashboards.widget(l.dashboardId, C.id, { context: i() });
    }
    function a() {
      o.value++;
    }
    function c(C) {
      return (h) => d.contextOptions(C, { search: h, lines: C === "lines" ? [] : m.lines });
    }
    async function k() {
      var C;
      f.value = null;
      try {
        const h = await d.dashboards.get(l.dashboardId), p = ((C = h.layout) == null ? void 0 : C.context) ?? {}, v = p.period ?? "";
        Object.assign(m, Array.isArray(v) ? { period: "custom", from: String(v[0]).slice(0, 10), to: String(v[1]).slice(0, 10) } : { period: typeof v == "string" ? v : "", from: "", to: "" });
        for (const w of ["lines", "divisions", "employees"]) m[w] = Array.isArray(p[w]) ? [...p[w]] : [];
        b.value = h, g("loaded", h);
        for (const w of ["lines", "divisions", "employees"])
          d.contextOptions(w, { lines: [] }).then((O) => M[w] = O.length > 0).catch(() => M[w] = !1);
      } catch (h) {
        f.value = h;
      }
    }
    return he(() => l.dashboardId, k), Se(k), (C, h) => {
      var p, v;
      return s(), n("div", {
        class: "rg-root rg-dashboard",
        "data-rg-theme": t.theme
      }, [
        f.value ? (s(), n("div", ym, [
          e("div", $m, [
            e("div", _m, [
              E(F, {
                name: f.value.status === 403 ? "lock" : "alert"
              }, null, 8, ["name"])
            ]),
            e("h2", null, y(f.value.status === 403 ? "You cannot open this dashboard" : "The dashboard could not be opened"), 1),
            e("p", null, y(f.value.message), 1),
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: k
            }, "Try again")
          ])
        ])) : (s(), n(U, { key: 1 }, [
          e("header", km, [
            e("div", wm, [
              b.value ? (s(), n("h1", xm, y(b.value.name), 1)) : (s(), n("div", Cm)),
              (p = b.value) != null && p.description ? (s(), n("div", Sm, [
                e("span", null, y(b.value.description), 1)
              ])) : x("", !0)
            ]),
            e("div", Mm, [
              (v = b.value) != null && v.can_edit ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn",
                onClick: h[0] || (h[0] = (w) => g("edit", b.value.uuid))
              }, [
                E(F, {
                  name: "fx",
                  small: ""
                }),
                h[8] || (h[8] = N(" Edit", -1))
              ])) : x("", !0),
              e("button", {
                type: "button",
                class: "rg-btn rg-btn--primary",
                disabled: !b.value,
                onClick: a
              }, [
                E(F, {
                  name: "play",
                  small: ""
                }),
                h[9] || (h[9] = N(" Refresh", -1))
              ], 8, Tm)
            ])
          ]),
          b.value ? (s(), n("form", {
            key: 0,
            class: "rg-viewer__filters",
            onSubmit: ge(a, ["prevent"])
          }, [
            e("label", Em, [
              e("span", null, [
                E(F, {
                  name: "calendar",
                  small: ""
                }),
                h[10] || (h[10] = N(" Period", -1))
              ]),
              se(e("select", {
                id: "rg-dash-period",
                "onUpdate:modelValue": h[1] || (h[1] = (w) => m.period = w),
                class: "rg-input",
                onChange: h[2] || (h[2] = (w) => m.period !== "custom" && a())
              }, [
                h[11] || (h[11] = e("option", { value: "" }, "As saved in each report", -1)),
                (s(!0), n(U, null, H(R(ps), ([w, O]) => (s(), n("option", {
                  key: w,
                  value: w
                }, y(O), 9, Om))), 128)),
                h[12] || (h[12] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 544), [
                [Pe, m.period]
              ])
            ]),
            m.period === "custom" ? (s(), n("div", Rm, [
              se(e("input", {
                "onUpdate:modelValue": h[3] || (h[3] = (w) => m.from = w),
                class: "rg-input",
                type: "date",
                "aria-label": "From",
                required: ""
              }, null, 512), [
                [ce, m.from]
              ]),
              h[13] || (h[13] = e("span", { class: "rg-faint" }, "to", -1)),
              se(e("input", {
                "onUpdate:modelValue": h[4] || (h[4] = (w) => m.to = w),
                class: "rg-input",
                type: "date",
                "aria-label": "To",
                required: ""
              }, null, 512), [
                [ce, m.to]
              ])
            ])) : x("", !0),
            M.lines ? (s(), n("div", Dm, [
              e("span", null, [
                E(F, {
                  name: "folder",
                  small: ""
                }),
                h[14] || (h[14] = N(" Lines", -1))
              ]),
              E(Ye, {
                modelValue: m.lines,
                "onUpdate:modelValue": h[5] || (h[5] = (w) => m.lines = w),
                label: "Lines",
                "all-label": "All my lines",
                load: c("lines"),
                onChange: a
              }, null, 8, ["modelValue", "load"])
            ])) : x("", !0),
            M.divisions ? (s(), n("div", Am, [
              e("span", null, [
                E(F, {
                  name: "users",
                  small: ""
                }),
                h[15] || (h[15] = N(" Divisions", -1))
              ]),
              E(Ye, {
                modelValue: m.divisions,
                "onUpdate:modelValue": h[6] || (h[6] = (w) => m.divisions = w),
                label: "Divisions",
                "all-label": "All my divisions",
                load: c("divisions"),
                "depends-on": m.lines,
                onChange: a
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : x("", !0),
            M.employees ? (s(), n("div", Lm, [
              e("span", null, [
                E(F, {
                  name: "users",
                  small: ""
                }),
                h[16] || (h[16] = N(" Employees", -1))
              ]),
              E(Ye, {
                modelValue: m.employees,
                "onUpdate:modelValue": h[7] || (h[7] = (w) => m.employees = w),
                label: "Employees",
                "all-label": "All my employees",
                load: c("employees"),
                "depends-on": m.lines,
                onChange: a
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : x("", !0),
            h[17] || (h[17] = e("button", {
              type: "submit",
              class: "rg-btn"
            }, "Apply", -1))
          ], 32)) : x("", !0),
          e("main", Nm, [
            b.value ? (s(), n("div", Fm, [
              (s(!0), n(U, null, H(b.value.layout.widgets, (w, O) => (s(), ae(vt, {
                key: w.id,
                widget: w,
                load: r(w),
                version: o.value,
                style: Me({ "--rg-delay": `${O * 50}ms` })
              }, null, 8, ["widget", "load", "version", "style"]))), 128)),
              b.value.layout.widgets.length ? x("", !0) : (s(), n("p", qm, "This dashboard has no widgets yet."))
            ])) : (s(), n("div", Vm, [
              (s(), n(U, null, H(4, (w) => e("div", {
                key: w,
                class: "rg-widget rg-widget--md"
              }, [
                e("div", Pm, [
                  (s(), n(U, null, H(4, (O) => e("span", {
                    key: O,
                    class: "rg-skeleton"
                  })), 64))
                ])
              ])), 64))
            ]))
          ])
        ], 64))
      ], 8, hm);
    };
  }
}, Im = ["data-rg-theme"], Um = { class: "rg-topbar" }, jm = { class: "rg-topbar__title" }, zm = { class: "rg-topbar__meta" }, Bm = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, Gm = { class: "rg-topbar__actions" }, Km = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Who can open it"
}, Hm = ["aria-pressed"], Wm = ["aria-pressed"], Ym = ["disabled"], Jm = { class: "rg-viewer__filters" }, Zm = {
  class: "rg-viewer__filter",
  for: "rg-dash-edit-period"
}, Qm = ["value"], Xm = { class: "rg-dashboard__body" }, ep = {
  key: 0,
  class: "rg-dashboard__grid"
}, tp = { class: "rg-widget__skeleton" }, sp = {
  key: 1,
  class: "rg-empty"
}, lp = { class: "rg-empty__icon" }, np = { class: "rg-widget__tools" }, ap = ["for"], op = ["id", "value", "onChange"], rp = ["value", "disabled"], ip = ["aria-label", "onClick"], up = ["aria-label", "title", "onClick"], dp = ["aria-label", "disabled", "onClick"], cp = ["aria-label", "disabled", "onClick"], gp = ["aria-label", "onClick"], mp = {
  key: 0,
  class: "rg-widget-dialog__preview"
}, pp = ["disabled"], kp = {
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
    const l = t, g = u, { api: d } = Le(), b = ft();
    Re("rg-theme", l.theme), Re("rg-widget-queue", vs(3));
    const f = [["sm", "Small"], ["md", "Half"], ["lg", "Two thirds"], ["full", "Full width"]], o = $e({ loading: !0, saving: !1, uuid: null, name: "Untitled dashboard", visibility: "private", canPublish: !1, published: !1, period: "", widgets: [] }), m = K(0), M = K(null), i = K([]), r = $e({}), a = K(null), c = K(!1);
    let k = 0;
    const C = () => `w${Date.now().toString(36)}${(++k).toString(36)}`, h = () => o.period ? { period: o.period } : {}, p = (q) => () => d.dashboards.preview(q, { context: h() });
    async function v(q) {
      if (!q) return { dims: [], nums: [] };
      if (!r[q]) {
        r[q] = { dims: [], nums: [], loading: !0 };
        try {
          const D = (await d.reports.view(q)).fields ?? [];
          r[q] = {
            dims: D.filter((A) => A.kind === "dimension").map((A) => ({ as: A.as, label: A.label ?? A.as })),
            nums: D.filter((A) => A.kind !== "dimension").map((A) => ({ as: A.as, label: A.label ?? A.as }))
          };
        } catch {
          r[q] = { dims: [], nums: [] };
        }
      }
      return r[q];
    }
    Se(async () => {
      var q, L, D;
      try {
        if (d.reports.list().then((A) => i.value = A.data ?? []).catch(() => {
        }), l.dashboardId) {
          const A = await d.dashboards.get(l.dashboardId);
          Object.assign(o, {
            uuid: A.uuid,
            name: A.name,
            visibility: A.visibility,
            canPublish: A.can_publish,
            published: A.published,
            period: typeof ((L = (q = A.layout) == null ? void 0 : q.context) == null ? void 0 : L.period) == "string" ? A.layout.context.period : "",
            widgets: A.layout.widgets ?? []
          });
        } else if (l.fromReport) {
          const A = await d.dashboards.generate(l.fromReport);
          Object.assign(o, { name: A.name, period: typeof ((D = A.context) == null ? void 0 : D.period) == "string" ? A.context.period : "", widgets: A.widgets });
        }
      } catch (A) {
        b.error(A);
      } finally {
        o.loading = !1;
      }
    });
    function w(q = null) {
      var D, A;
      const L = (q == null ? void 0 : q.report) ?? ((D = o.widgets[0]) == null ? void 0 : D.report) ?? l.fromReport ?? ((A = i.value[0]) == null ? void 0 : A.uuid) ?? "";
      M.value = q ? { ...q, values: [...q.values ?? []] } : { id: null, type: "kpi", title: "", report: L, category: null, values: [], top: 10, size: "sm" }, v(M.value.report);
    }
    const O = G(() => {
      var q, L;
      return r[(q = M.value) == null ? void 0 : q.report] ?? { dims: [], nums: [], loading: !!((L = M.value) != null && L.report) };
    }), _ = G(() => {
      const q = M.value;
      return q != null && q.report ? q.type === "table" ? !0 : q.values.length ? q.type === "kpi" || !!q.category : !1 : !1;
    });
    function S(q, L) {
      o.widgets = o.widgets.map((D) => D.id === q.id ? gs(D, L) : D);
    }
    function $() {
      var D, A, T;
      const q = { ...M.value };
      if (!((D = q.title) == null ? void 0 : D.trim())) {
        const V = O.value.nums;
        q.title = q.values.map((re) => {
          var ie;
          return ((ie = V.find((fe) => fe.as === re)) == null ? void 0 : ie.label) ?? re;
        }).join(", ") || ((A = i.value.find((re) => re.uuid === q.report)) == null ? void 0 : A.name) || "Widget";
      }
      q.report_name = ((T = i.value.find((V) => V.uuid === q.report)) == null ? void 0 : T.name) ?? q.report_name, q.id ? o.widgets = o.widgets.map((V) => V.id === q.id ? q : V) : o.widgets = [...o.widgets, { ...q, id: C() }], M.value = null;
    }
    function X(q) {
      o.widgets = o.widgets.filter((L) => L.id !== q);
    }
    function W(q, L) {
      const D = [...o.widgets], A = D.findIndex((V) => V.id === q), T = A + L;
      A === -1 || T < 0 || T >= D.length || (D.splice(T, 0, D.splice(A, 1)[0]), o.widgets = D);
    }
    function pe(q) {
      const L = f.map(([A]) => A), D = L[(L.indexOf(q.size ?? "md") + 1) % L.length];
      o.widgets = o.widgets.map((A) => A.id === q.id ? { ...A, size: D } : A);
    }
    function z(q) {
      if (!a.value || a.value === q) return;
      const L = [...o.widgets], D = L.findIndex((T) => T.id === a.value), A = L.findIndex((T) => T.id === q);
      L.splice(A, 0, L.splice(D, 1)[0]), o.widgets = L, a.value = null;
    }
    async function B() {
      o.saving = !0;
      const q = {
        name: o.name.trim() || "Untitled dashboard",
        visibility: o.visibility,
        layout: { context: h(), widgets: o.widgets.map(({ report_name: L, ...D }) => D) }
      };
      try {
        const L = o.uuid ? await d.dashboards.update(o.uuid, q) : await d.dashboards.create(q);
        Object.assign(o, { uuid: L.uuid, canPublish: L.can_publish, published: L.published }), b.success(`Saved "${L.name}".`), g("saved", L);
      } catch (L) {
        b.error(L);
      } finally {
        o.saving = !1;
      }
    }
    return (q, L) => (s(), n("div", {
      class: "rg-root rg-dashboard rg-dashboard--editing",
      "data-rg-theme": t.theme
    }, [
      e("header", Um, [
        e("div", jm, [
          L[18] || (L[18] = e("label", {
            class: "rg-sr-only",
            for: "rg-dash-name"
          }, "Dashboard name", -1)),
          se(e("input", {
            id: "rg-dash-name",
            "onUpdate:modelValue": L[0] || (L[0] = (D) => o.name = D),
            class: "rg-input rg-input--bare rg-name-input",
            maxlength: "255"
          }, null, 512), [
            [ce, o.name]
          ]),
          e("div", zm, [
            e("span", null, y(o.widgets.length) + " " + y(o.widgets.length === 1 ? "widget" : "widgets"), 1),
            o.published ? (s(), n("span", Bm, [
              E(F, {
                name: "globe",
                small: ""
              }),
              L[17] || (L[17] = N(" Published", -1))
            ])) : x("", !0)
          ])
        ]),
        e("div", Gm, [
          e("div", Km, [
            e("button", {
              type: "button",
              "aria-pressed": o.visibility === "private",
              onClick: L[1] || (L[1] = (D) => o.visibility = "private")
            }, "Only me", 8, Hm),
            e("button", {
              type: "button",
              "aria-pressed": o.visibility === "public",
              onClick: L[2] || (L[2] = (D) => o.visibility = "public")
            }, "Everyone", 8, Wm)
          ]),
          o.uuid && o.canPublish ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn",
            onClick: L[3] || (L[3] = (D) => c.value = !0)
          }, [
            E(F, {
              name: "globe",
              small: ""
            }),
            N(" " + y(o.published ? "Publishing" : "Publish"), 1)
          ])) : x("", !0),
          o.uuid ? (s(), n("button", {
            key: 1,
            type: "button",
            class: "rg-btn",
            onClick: L[4] || (L[4] = (D) => g("view", o.uuid))
          }, [
            E(F, {
              name: "eye",
              small: ""
            }),
            L[19] || (L[19] = N(" View", -1))
          ])) : x("", !0),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            disabled: o.saving || !o.widgets.length,
            onClick: B
          }, [
            E(F, {
              name: "save",
              small: ""
            }),
            N(" " + y(o.saving ? "Saving…" : "Save"), 1)
          ], 8, Ym)
        ])
      ]),
      e("div", Jm, [
        e("label", Zm, [
          e("span", null, [
            E(F, {
              name: "calendar",
              small: ""
            }),
            L[20] || (L[20] = N(" Default period", -1))
          ]),
          se(e("select", {
            id: "rg-dash-edit-period",
            "onUpdate:modelValue": L[5] || (L[5] = (D) => o.period = D),
            class: "rg-input",
            onChange: L[6] || (L[6] = (D) => m.value++)
          }, [
            L[21] || (L[21] = e("option", { value: "" }, "As saved in each report", -1)),
            (s(!0), n(U, null, H(R(ps), ([D, A]) => (s(), n("option", {
              key: D,
              value: D
            }, y(A), 9, Qm))), 128))
          ], 544), [
            [Pe, o.period]
          ])
        ]),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          onClick: L[7] || (L[7] = (D) => w())
        }, [
          E(F, {
            name: "plus",
            small: ""
          }),
          L[22] || (L[22] = N(" Add widget", -1))
        ])
      ]),
      e("main", Xm, [
        o.loading ? (s(), n("div", ep, [
          (s(), n(U, null, H(4, (D) => e("div", {
            key: D,
            class: "rg-widget rg-widget--md"
          }, [
            e("div", tp, [
              (s(), n(U, null, H(4, (A) => e("span", {
                key: A,
                class: "rg-skeleton"
              })), 64))
            ])
          ])), 64))
        ])) : o.widgets.length ? (s(), ae(lt, {
          key: 2,
          tag: "div",
          name: "rg-list-move",
          class: "rg-dashboard__grid"
        }, {
          default: de(() => [
            (s(!0), n(U, null, H(o.widgets, (D, A) => (s(), ae(vt, {
              key: D.id,
              widget: D,
              load: p(D),
              version: m.value,
              class: ne({ "is-dragging": a.value === D.id }),
              draggable: "true",
              onDragstart: (T) => a.value = D.id,
              onDragend: L[9] || (L[9] = (T) => a.value = null),
              onDragover: L[10] || (L[10] = ge(() => {
              }, ["prevent"])),
              onDrop: ge((T) => z(D.id), ["prevent"])
            }, {
              actions: de(() => {
                var T;
                return [
                  e("div", np, [
                    e("label", {
                      class: "rg-sr-only",
                      for: `rg-type-${D.id}`
                    }, "Show " + y(D.title) + " as", 9, ap),
                    e("select", {
                      id: `rg-type-${D.id}`,
                      class: "rg-input rg-widget__type",
                      value: D.type,
                      title: "Show as",
                      onChange: (V) => S(D, V.target.value)
                    }, [
                      (s(!0), n(U, null, H(R(ds), (V) => (s(), n("option", {
                        key: V.value,
                        value: V.value,
                        disabled: !V.fits(D)
                      }, y(V.label), 9, rp))), 128))
                    ], 40, op),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Edit ${D.title}`,
                      onClick: (V) => w(D)
                    }, [
                      E(F, {
                        name: "fx",
                        small: ""
                      })
                    ], 8, ip),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Resize ${D.title}`,
                      title: `Size: ${(T = f.find(([V]) => V === (D.size ?? "md"))) == null ? void 0 : T[1]}`,
                      onClick: (V) => pe(D)
                    }, y({ sm: "S", md: "M", lg: "L", full: "Full" }[D.size ?? "md"]), 9, up),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${D.title} earlier`,
                      disabled: A === 0,
                      onClick: (V) => W(D.id, -1)
                    }, "‹", 8, dp),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${D.title} later`,
                      disabled: A === o.widgets.length - 1,
                      onClick: (V) => W(D.id, 1)
                    }, "›", 8, cp),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Remove ${D.title}`,
                      onClick: (V) => X(D.id)
                    }, [
                      E(F, {
                        name: "trash",
                        small: ""
                      })
                    ], 8, gp)
                  ])
                ];
              }),
              _: 2
            }, 1032, ["widget", "load", "version", "class", "onDragstart", "onDrop"]))), 128))
          ]),
          _: 1
        })) : (s(), n("div", sp, [
          e("div", lp, [
            E(F, { name: "view" })
          ]),
          L[24] || (L[24] = e("h2", null, "Add your first widget", -1)),
          L[25] || (L[25] = e("p", null, "Show a report's totals as headline numbers, its top items as bars, how it changes over time, or its first rows.", -1)),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: L[8] || (L[8] = (D) => w())
          }, [
            E(F, {
              name: "plus",
              small: ""
            }),
            L[23] || (L[23] = N(" Add widget", -1))
          ])
        ]))
      ]),
      M.value ? (s(), ae(ze, {
        key: 0,
        title: M.value.id ? "Edit widget" : "Add widget",
        class: "rg-widget-dialog",
        "data-rg-theme": t.theme,
        onClose: L[13] || (L[13] = (D) => M.value = null)
      }, {
        footer: de(() => [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: L[12] || (L[12] = (D) => M.value = null)
          }, "Cancel"),
          e("button", {
            type: "submit",
            form: "rg-widget-form",
            class: "rg-btn rg-btn--primary",
            disabled: !_.value
          }, y(M.value.id ? "Update" : "Add"), 9, pp)
        ]),
        default: de(() => [
          e("form", {
            id: "rg-widget-form",
            class: "rg-publish",
            onSubmit: L[11] || (L[11] = ge((D) => _.value && $(), ["prevent"]))
          }, [
            E(ms, {
              widget: M.value,
              reports: i.value,
              columns: O.value,
              onReport: v
            }, null, 8, ["widget", "reports", "columns"]),
            _.value ? (s(), n("div", mp, [
              L[26] || (L[26] = e("span", { class: "rg-faint" }, "Preview", -1)),
              E(vt, {
                widget: { ...M.value, size: "full" },
                load: p(M.value),
                version: m.value
              }, null, 8, ["widget", "load", "version"])
            ])) : x("", !0)
          ], 32)
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : x("", !0),
      c.value ? (s(), ae(Rt, {
        key: 1,
        kind: "dashboard",
        uuid: o.uuid,
        name: o.name,
        onClose: L[14] || (L[14] = (D) => c.value = !1),
        onPublished: L[15] || (L[15] = (D) => {
          o.published = !0, g("published", D);
        }),
        onUnpublished: L[16] || (L[16] = (D) => {
          o.published = !1, g("published", D);
        })
      }, null, 8, ["uuid", "name"])) : x("", !0),
      E(bt, {
        toasts: R(b),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, Im));
  }
};
export {
  Fc as CombinedBuilder,
  kp as DashboardEditor,
  _p as DashboardView,
  At as PinToDashboard,
  Rt as PublishDialog,
  Xt as REPORT_GENERATOR_KEY,
  hp as ReportBuilder,
  jt as ReportGeneratorApiError,
  yp as ReportLibrary,
  $p as ReportViewer,
  bp as TopicsBrowser,
  _s as createApiClient,
  fp as createReportGenerator,
  Le as useReportGenerator
};
//# sourceMappingURL=report-generator.js.map
