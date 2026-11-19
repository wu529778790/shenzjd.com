/* @wu529778790/floating-qr v0.1.16 */
"use strict";
(() => {
  // src/FloatingQR.ts
  var DEFAULT_BLOCKS = {
    wechat: {
      src: "https://cdn.jsdmirror.com/gh/wu529778790/img.shenzjd.com@master/wp/1782738963299-5wrchz.jpg",
      title: "\u516C\u4F17\u53F7",
      desc: "\u5173\u6CE8\u516C\u4F17\u53F7\u9632\u5931\u8054"
    },
    // 小程序区块（默认渲染；已由赞赏码换成小程序）
    donate: {
      src: "https://cdn.jsdmirror.com/gh/wu529778790/img.shenzjd.com@master/blog/imgx-20260828-153016-d3e9.jpg",
      title: "\u5C0F\u7A0B\u5E8F",
      desc: ""
    }
  };
  var DEFAULT_THEME = {
    bg: "rgba(255, 255, 255, 0.96)",
    accent: "#333",
    radius: "12px",
    border: "rgba(0, 0, 0, 0.1)"
  };
  var DEFAULT_LINKS = [
    { href: "https://t.me/shenzjd_com", icon: "tg", title: "Telegram" },
    { href: "https://github.com/wu529778790", icon: "github", title: "GitHub" },
    { href: "https://x.com/shenzujiudi", icon: "x", title: "X" }
  ];
  var LINK_ICONS = {
    tg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M21.9 4.6c.3-1.2-.9-2.2-2-1.7L2.7 10.2c-1.2.5-1.1 2.2.1 2.6l4.3 1.4 1.6 5.2c.3 1.1 1.7 1.4 2.5.6l2.4-2.4 4.5 3.3c1 .7 2.4.2 2.7-1L21.9 4.6zM8.6 13.5l8.7-5.4c.1-.1.3.1.2.2l-6.8 6.7c-.2.2-.3.4-.4.7l-.5 2.6c0 .1-.2.1-.2 0l-.9-4.7c-.1-.1 0-.2 0-.1z"/></svg>',
    github: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.4 6.8-5.2 6.8-9.7C22 6.6 17.5 2 12 2z"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3.1l-6.7 7.7L21.8 21h-6.2l-4.8-6.3L5.1 21H2l7.2-8.2L2.5 3h6.3l4.4 5.8L17.5 3zm-1.1 16.1h1.7L8.1 4.7H6.3L16.4 19.1z"/></svg>'
  };
  function resolveLinkIcon(icon, title) {
    if (!icon) return escapeHtml((title || "\u2022").slice(0, 1));
    if (LINK_ICONS[icon]) return LINK_ICONS[icon];
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(icon) || icon.startsWith("data:")) {
      return `<img class="fq-link-img" src="${escapeAttr(icon)}" alt="" loading="lazy" />`;
    }
    if (icon.includes("<")) return icon;
    return escapeHtml(icon.slice(0, 1));
  }
  var STORAGE_KEY = "floating-qr:closed";
  var MOBILE_QUERY = "(max-width: 767px)";
  function isMobile() {
    var _a, _b, _c;
    if (typeof window === "undefined") return false;
    return (_c = (_b = (_a = window.matchMedia) == null ? void 0 : _a.call(window, MOBILE_QUERY)) == null ? void 0 : _b.matches) != null ? _c : false;
  }
  function hasCloseMark() {
    if (typeof localStorage === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setCloseMark() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
    }
  }
  var FloatingQR = class _FloatingQR {
    constructor(options = {}, container = document.body) {
      this.el = null;
      this.closeBtn = null;
      this.handleClose = () => {
        this.close();
      };
      this.opts = this.resolve(options);
      if (this.opts.hideOnMobile && isMobile()) {
        return;
      }
      if (this.opts.closePersistence && hasCloseMark()) {
        return;
      }
      this.render(container);
    }
    /** 是否已挂载到页面 */
    isMounted() {
      return this.el !== null && this.el.isConnected;
    }
    /** 关闭浮窗（完全移除）。默认不记住状态，刷新后重新出现 */
    close() {
      if (this.opts.closePersistence) {
        setCloseMark();
      }
      this.destroy();
    }
    /** 从页面移除并解绑 */
    destroy() {
      var _a, _b;
      (_a = this.closeBtn) == null ? void 0 : _a.removeEventListener("click", this.handleClose);
      this.closeBtn = null;
      (_b = this.el) == null ? void 0 : _b.remove();
      this.el = null;
    }
    /** 用新配置重渲染（会先销毁当前实例） */
    update(options) {
      this.destroy();
      const fresh = new _FloatingQR(options);
      this.opts.theme = fresh.opts.theme;
      this.opts.themeOverrides = fresh.opts.themeOverrides;
      this.opts.position = fresh.opts.position;
      this.opts.closePersistence = fresh.opts.closePersistence;
      this.opts.hideOnMobile = fresh.opts.hideOnMobile;
      this.opts.zIndex = fresh.opts.zIndex;
      this.opts.wechat = fresh.opts.wechat;
      this.opts.donate = fresh.opts.donate;
      this.opts.links = fresh.opts.links;
      this.el = fresh.el;
      this.closeBtn = fresh.closeBtn;
    }
    resolve(options) {
      var _a, _b, _c, _d, _e, _f, _g;
      const block = (b, key) => {
        var _a2, _b2, _c2;
        const def = DEFAULT_BLOCKS[key];
        return {
          src: (_a2 = b == null ? void 0 : b.src) != null ? _a2 : def.src,
          title: (_b2 = b == null ? void 0 : b.title) != null ? _b2 : def.title,
          desc: (_c2 = b == null ? void 0 : b.desc) != null ? _c2 : def.desc
        };
      };
      return {
        wechat: block(options.wechat, "wechat"),
        donate: block(options.donate, "donate"),
        position: (_a = options.position) != null ? _a : "right-center",
        closePersistence: (_b = options.closePersistence) != null ? _b : false,
        hideOnMobile: (_c = options.hideOnMobile) != null ? _c : true,
        zIndex: (_d = options.zIndex) != null ? _d : 9999,
        theme: { ...DEFAULT_THEME, ...(_e = options.theme) != null ? _e : {} },
        themeOverrides: (_f = options.theme) != null ? _f : {},
        links: (_g = options.links) != null ? _g : DEFAULT_LINKS
      };
    }
    render(container = document.body) {
      var _a;
      const { wechat, donate, position, zIndex, themeOverrides, links } = this.opts;
      const root = document.createElement("div");
      root.className = "fq-widget";
      root.dataset.position = position;
      root.style.zIndex = String(zIndex);
      const overrides = [
        ["--fq-bg", themeOverrides.bg],
        ["--fq-accent", themeOverrides.accent],
        ["--fq-radius", themeOverrides.radius],
        ["--fq-border", themeOverrides.border]
      ];
      for (const [key, value] of overrides) {
        if (value !== void 0) root.style.setProperty(key, value);
      }
      root.innerHTML = `
      <button class="fq-close" type="button" aria-label="\u5173\u95ED\u6D6E\u7A97">${CLOSE_SVG}</button>
      <div class="fq-section">
        <div class="fq-qr">
          <img class="fq-img" src="${escapeAttr(wechat.src)}" alt="${escapeAttr(wechat.title)}" loading="lazy" />
        </div>
        <p class="fq-label">${escapeHtml(wechat.title)}</p>
        ${wechat.desc ? `<p class="fq-desc">${escapeHtml(wechat.desc)}</p>` : ""}
      </div>
      ${donate ? `<div class="fq-divider" role="separator"></div>
      <div class="fq-section">
        <div class="fq-qr">
          <img class="fq-img" src="${escapeAttr(donate.src)}" alt="${escapeAttr(donate.title)}" loading="lazy" />
        </div>
        <p class="fq-label">${escapeHtml(donate.title)}</p>
        ${donate.desc ? `<p class="fq-desc">${escapeHtml(donate.desc)}</p>` : ""}
      </div>` : ""}
      ${links.length ? `<div class="fq-links">${links.map(
        (link) => {
          var _a2;
          return `
        <a class="fq-link" href="${escapeAttr(link.href)}" title="${escapeAttr((_a2 = link.title) != null ? _a2 : "")}" target="_blank" rel="noopener noreferrer">${resolveLinkIcon(link.icon, link.title)}</a>`;
        }
      ).join("")}
        </div>` : ""}
    `;
      this.closeBtn = root.querySelector(".fq-close");
      (_a = this.closeBtn) == null ? void 0 : _a.addEventListener("click", this.handleClose);
      container.appendChild(root);
      this.el = root;
    }
  };
  var CLOSE_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escapeAttr(value) {
    return escapeHtml(value);
  }

  // src/styles.css
  var styles_default = '.fq-widget {\n  --fq-bg: rgba(255, 255, 255, 0.96);\n  --fq-accent: #333;\n  --fq-radius: 12px;\n  --fq-border: rgba(0, 0, 0, 0.1);\n  --fq-offset: 16px;\n  --fq-width: 150px;\n\n  position: fixed;\n  z-index: 9999;\n  box-sizing: border-box;\n  width: var(--fq-width);\n  padding: 14px;\n  background: var(--fq-bg);\n  border: 1px solid var(--fq-border);\n  border-radius: var(--fq-radius);\n  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,\n    "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",\n    sans-serif;\n  color: var(--fq-accent);\n  line-height: 1.5;\n  color-scheme: light dark;\n}\n\n.fq-widget[data-position="right-bottom"] {\n  right: var(--fq-offset);\n  bottom: var(--fq-offset);\n}\n\n.fq-widget[data-position="right-top"] {\n  right: var(--fq-offset);\n  top: var(--fq-offset);\n}\n\n.fq-widget[data-position="left-bottom"] {\n  left: var(--fq-offset);\n  bottom: var(--fq-offset);\n}\n\n.fq-widget[data-position="left-top"] {\n  left: var(--fq-offset);\n  top: var(--fq-offset);\n}\n\n.fq-widget[data-position="right-center"] {\n  right: var(--fq-offset);\n  top: 50%;\n  transform: translateY(-50%);\n}\n\n.fq-widget[data-position="left-center"] {\n  left: var(--fq-offset);\n  top: 50%;\n  transform: translateY(-50%);\n}\n\n.fq-close {\n  position: absolute;\n  top: -2px;\n  right: -2px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  padding: 0;\n  margin: 0;\n  border: none;\n  border-radius: 50%;\n  background: transparent;\n  color: rgba(0, 0, 0, 0.35);\n  cursor: pointer;\n  transition: color 0.15s ease, opacity 0.15s ease;\n}\n\n.fq-close:hover {\n  color: rgba(0, 0, 0, 0.7);\n}\n\n/* \u89E6\u5C4F\u8BBE\u5907\uFF08\u65E0 hover\uFF09\uFF1A\u5173\u95ED\u6309\u94AE\u5E38\u663E\uFF0C\u4FDD\u8BC1\u53EF\u5173\u95ED */\n.fq-close {\n  opacity: 1;\n}\n\n/* \u652F\u6301 hover \u7684\u8BBE\u5907\uFF08\u9F20\u6807\uFF09\uFF1A\u5E73\u65F6\u9690\u85CF\uFF0C\u60AC\u505C\u5361\u7247\u65F6\u6D6E\u73B0 */\n@media (hover: hover) and (pointer: fine) {\n  .fq-close {\n    opacity: 0;\n    pointer-events: none;\n  }\n  .fq-widget:hover .fq-close,\n  .fq-close:focus-visible {\n    opacity: 1;\n    pointer-events: auto;\n  }\n}\n\n.fq-section {\n  text-align: center;\n}\n\n.fq-qr {\n  overflow: hidden;\n  border-radius: 4px;\n}\n\n.fq-img {\n  display: block;\n  width: 100%;\n  height: auto;\n}\n\n.fq-label {\n  margin: 8px 0 0;\n  font-size: 12px;\n  font-weight: 500;\n  color: var(--fq-accent);\n}\n\n.fq-desc {\n  margin: 2px 0 0;\n  font-size: 11px;\n  color: rgba(0, 0, 0, 0.45);\n}\n\n.fq-divider {\n  height: 1px;\n  margin: 10px 0;\n  background: var(--fq-border);\n}\n\n/* \u5E95\u90E8\u793E\u4EA4\u94FE\u63A5\uFF08Telegram / GitHub / X \u7B49\uFF09 */\n.fq-links {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  margin-top: 10px;\n  padding-top: 10px;\n  border-top: 1px solid var(--fq-border);\n}\n\n.fq-link {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  color: rgba(0, 0, 0, 0.45);\n  text-decoration: none;\n  transition: color 0.15s ease, background 0.15s ease;\n}\n\n.fq-link:hover {\n  color: var(--fq-accent);\n  background: rgba(0, 0, 0, 0.05);\n}\n\n.fq-link svg {\n  display: block;\n}\n\n.fq-link-img {\n  width: 16px;\n  height: 16px;\n}\n\n.fq-link-txt {\n  font-size: 12px;\n  line-height: 1;\n}\n\n@media (max-width: 767px) {\n  .fq-widget {\n    width: 120px;\n    padding: 10px;\n  }\n}\n\n/* \u8DDF\u968F\u7CFB\u7EDF\u6DF1\u8272\u6A21\u5F0F \u2014\u2014 \u5FC5\u987B\u653E\u6587\u4EF6\u672B\u5C3E\uFF0C\u786E\u4FDD\u4F18\u5148\u7EA7\u9AD8\u4E8E\u4E0A\u9762\u7684\u6D45\u8272\u89C4\u5219\n   (\u4EC5\u5F71\u54CD\u9ED8\u8BA4\u503C\uFF1B\u7528\u6237\u663E\u5F0F\u8BBE\u7F6E\u7684 --fq-* inline \u53D8\u91CF\u4ECD\u4F18\u5148) */\n@media (prefers-color-scheme: dark) {\n  .fq-widget {\n    --fq-bg: rgba(28, 28, 30, 0.96);\n    --fq-accent: rgba(255, 255, 255, 0.92);\n    --fq-border: rgba(255, 255, 255, 0.14);\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);\n  }\n\n  .fq-close {\n    color: rgba(255, 255, 255, 0.4);\n  }\n\n  .fq-close:hover {\n    color: rgba(255, 255, 255, 0.8);\n  }\n\n  .fq-desc {\n    color: rgba(255, 255, 255, 0.55);\n  }\n\n  .fq-link {\n    color: rgba(255, 255, 255, 0.5);\n  }\n\n  .fq-link:hover {\n    color: var(--fq-accent);\n    background: rgba(255, 255, 255, 0.08);\n  }\n}\n';

  // src/web-component.ts
  var TAG = "floating-qr";
  var GLOBAL_KEY = "__FLOATING_QR_OPTIONS__";
  var AUTO_FLAG = "__floatingQrAutoInjected__";
  var MOBILE_QUERY2 = "(max-width: 767px)";
  function readGlobal() {
    return window[GLOBAL_KEY];
  }
  function boolAttr(el, name, fallback) {
    const v = el.getAttribute(name);
    if (v === null) return fallback;
    return v === "" || v === "true" || v === "1";
  }
  function numAttr(el, name, fallback) {
    const v = el.getAttribute(name);
    if (v === null || v === "") return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  var THEME_ATTRS = [
    ["theme-bg", "bg"],
    ["theme-accent", "accent"],
    ["theme-radius", "radius"],
    ["theme-border", "border"]
  ];
  function parseLinkHrefs(raw) {
    if (raw === null) return null;
    const trimmed = raw.trim().toLowerCase();
    if (trimmed === "" || trimmed === "none" || trimmed === "off") return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean).map((href) => {
      const guess = /github\.com/i.test(href) ? "github" : /t\.me/i.test(href) ? "tg" : /x\.com|twitter\.com/i.test(href) ? "x" : void 0;
      return { href, icon: guess, title: guess };
    });
  }
  var FloatingQRElement = class extends HTMLElement {
    constructor() {
      super();
      this.widget = null;
      this.raf = 0;
      this.shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = styles_default;
      this.shadow.appendChild(style);
    }
    static get observedAttributes() {
      return [
        "position",
        "close-persistence",
        "hide-on-mobile",
        "z-index",
        "wechat-src",
        "wechat-title",
        "wechat-desc",
        "donate-src",
        "donate-title",
        "donate-desc",
        "link-hrefs",
        ...THEME_ATTRS.map(([attr]) => attr)
      ];
    }
    connectedCallback() {
      this.renderSoon();
    }
    disconnectedCallback() {
      var _a;
      cancelAnimationFrame(this.raf);
      (_a = this.widget) == null ? void 0 : _a.destroy();
      this.widget = null;
    }
    attributeChangedCallback() {
      if (this.isConnected) this.renderSoon();
    }
    /** 以当前属性 + 全局配置重建实例 */
    render() {
      var _a, _b, _c;
      if (!this.isConnected) return;
      const opts = this.buildOptions();
      if (opts.hideOnMobile && ((_b = (_a = window.matchMedia) == null ? void 0 : _a.call(window, MOBILE_QUERY2)) == null ? void 0 : _b.matches)) return;
      (_c = this.widget) == null ? void 0 : _c.destroy();
      this.widget = new FloatingQR(opts, this.shadow);
    }
    renderSoon() {
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => this.render());
    }
    buildOptions() {
      var _a, _b, _c, _d, _e, _f;
      const global = (_a = readGlobal()) != null ? _a : {};
      const get = (name) => this.getAttribute(name);
      const theme = {};
      for (const [attr, key] of THEME_ATTRS) {
        const v = get(attr);
        if (v !== null) theme[key] = v;
      }
      const block = (prefix, fallback) => {
        const src = get(`${prefix}-src`);
        const title = get(`${prefix}-title`);
        const desc = get(`${prefix}-desc`);
        if (src === null && title === null && desc === null) return fallback;
        const b = {};
        if (src !== null) b.src = src;
        if (title !== null) b.title = title;
        if (desc !== null) b.desc = desc;
        return b;
      };
      const attrHrefs = get("link-hrefs");
      const attrParsed = parseLinkHrefs(attrHrefs);
      return {
        ...global,
        position: (_b = get("position")) != null ? _b : global.position,
        closePersistence: boolAttr(this, "close-persistence", (_c = global.closePersistence) != null ? _c : false),
        hideOnMobile: boolAttr(this, "hide-on-mobile", (_d = global.hideOnMobile) != null ? _d : true),
        zIndex: numAttr(this, "z-index", (_e = global.zIndex) != null ? _e : 9999),
        theme: { ...(_f = global.theme) != null ? _f : {}, ...theme },
        wechat: block("wechat", global.wechat),
        donate: block("donate", global.donate),
        links: attrParsed != null ? attrParsed : global.links
      };
    }
  };
  function autoInit() {
    const doc = document.documentElement;
    if ((doc == null ? void 0 : doc.getAttribute("data-fq-auto")) === "false") return;
    if (document.querySelector(TAG)) return;
    if (window[AUTO_FLAG]) return;
    window[AUTO_FLAG] = true;
    const el = document.createElement(TAG);
    document.body.appendChild(el);
  }
  if (!customElements.get(TAG)) {
    customElements.define(TAG, FloatingQRElement);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", autoInit);
    } else {
      autoInit();
    }
  }
})();
