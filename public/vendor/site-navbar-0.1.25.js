/* @wu529778790/site-navbar v0.1.25 */
"use strict";
(() => {
  // src/styles.css
  var styles_default = '/* ============================================================\n  site-navbar \u7EC4\u4EF6\u6837\u5F0F\n  \u5168\u90E8\u4E3B\u9898\u901A\u8FC7 --sn-* CSS \u53D8\u91CF\u9A71\u52A8\uFF0C\u76F4\u63A5\u8986\u76D6\u53D8\u91CF\u5373\u53EF\u6362\u80A4\u3002\n\n  \u6DF1\u6D45\u8272\u81EA\u9002\u5E94\uFF1A\n  - \u9ED8\u8BA4\u503C\u7528 light-dark(\u6D45\u8272, \u6DF1\u8272)\uFF0C\u989C\u8272\u968F\u5BBF\u4E3B\u9875\u9762\u58F0\u660E\u7684 color-scheme \u5207\u6362\uFF1A\n    \u5BBF\u4E3B\u58F0\u660E color-scheme: light / dark \u65F6\u7EC4\u4EF6\u5BF9\u5E94\u4F7F\u7528\u6D45\u8272 / \u6DF1\u8272\u4E3B\u9898\uFF1B\n    \u5BBF\u4E3B\u672A\u58F0\u660E\u65F6\u7EE7\u627F UA \u9ED8\u8BA4\uFF0C\u8DDF\u968F\u7CFB\u7EDF prefers-color-scheme\uFF1B\n  - \u4E0D\u652F\u6301 light-dark() \u7684\u8001\u6D4F\u89C8\u5668\uFF0C\u7531\u4E0B\u65B9 @media (prefers-color-scheme: dark)\n    \u515C\u5E95\u4E3A\u7EAF\u6DF1\u8272\u503C\uFF1B\n  - \u7528\u6237\u663E\u5F0F\u4F20\u5165 theme / \u8986\u76D6 --sn-* \u53D8\u91CF\u65F6\u4F18\u5148\u7EA7\u6700\u9AD8\uFF0C\u4E0D\u968F\u7CFB\u7EDF\u53D8\u5316\u3002\n  ============================================================ */\n\n/* \u53D8\u91CF\u9ED8\u8BA4\u503C\u540C\u65F6\u4F5C\u7528\u4E8E .sn-root\uFF08shadow/\u666E\u901A DOM\uFF09\u4E0E .sn-mobile\uFF08portal \u5230\n   body\uFF0C\u8131\u79BB .sn-root \u540E\u65E0\u6CD5\u7EE7\u627F\u5176\u53D8\u91CF\uFF0C\u987B\u81EA\u8EAB\u6301\u6709\u9ED8\u8BA4\u503C\uFF09 */\n.sn-root,\n.sn-mobile {\n  /* ===== \u4E3B\u9898\u53D8\u91CF\uFF08\u9ED8\u8BA4\u503C\uFF0C\u53EF\u5728\u4EFB\u610F\u7236\u7EA7\u8986\u76D6\uFF09 ===== */\n  --sn-primary: light-dark(#1f2328, #e6edf3); /* \u54C1\u724C / hover \u6587\u5B57 */\n  --sn-secondary: light-dark(#656d76, #8b949e); /* \u9ED8\u8BA4\u94FE\u63A5\u6587\u5B57 */\n  --sn-accent: light-dark(#1a6dff, #4d9fff); /* \u5F53\u524D\u7AD9\u9AD8\u4EAE */\n  --sn-hover-bg: light-dark(rgba(31, 35, 40, 0.06), rgba(255, 255, 255, 0.08)); /* hover \u80CC\u666F\uFF08\u94FE\u63A5 hover \u5DF2\u6539\u4E3A\u7EAF\u6587\u5B57\u53D8\u8272\uFF0C\u73B0\u4EC5 hamburger \u6309\u94AE\u4F7F\u7528\uFF09 */\n  --sn-bg: light-dark(rgba(255, 255, 255, 0.55), rgba(28, 31, 36, 0.55)); /* \u4FDD\u7559\u53D8\u91CF\uFF1A\u5F53\u524D\u7AD9\u9AD8\u4EAE\u5DF2\u6539\u4E3A\u7EAF\u6587\u5B57\u53D8\u8272\uFF0C\u4E0D\u518D\u4F7F\u7528\u80CC\u666F */\n  --sn-border: light-dark(rgba(27, 31, 36, 0.14), rgba(255, 255, 255, 0.14)); /* \u8FB9\u6846 / \u5E95\u90E8\u5206\u9694\u7EBF */\n  --sn-radius: 12px; /* \u94FE\u63A5\u5706\u89D2 */\n  --sn-font-size: 0.875rem; /* \u94FE\u63A5\u5B57\u53F7\uFF0814px\uFF09 */\n  --sn-gap: 0.125rem; /* \u94FE\u63A5\u95F4\u8DDD */\n  --sn-pad-x: 1rem; /* \u5BFC\u822A\u5185\u5BB9\u5DE6\u53F3\u5185\u8FB9\u8DDD\uFF08logo / \u5934\u50CF\u4E0D\u8D34\u89C6\u53E3\u8FB9\u7F18\uFF09 */\n  --sn-avatar-size: 2.2rem; /* \u5934\u50CF\u5BB9\u5668\u5C3A\u5BF8\uFF0C\u7EA6\u675F user-avatar \u4E0D\u8D85\u51FA\u5BFC\u822A\u680F */\n  --sn-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,\n    "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",\n    sans-serif;\n}\n\n/* \u4E0D\u652F\u6301 light-dark() \u7684\u6D4F\u89C8\u5668\uFF1A\u6DF1\u8272\u7CFB\u7EDF\u4E0B\u7528\u7EAF\u6DF1\u8272\u503C\u515C\u5E95 */\n@media (prefers-color-scheme: dark) {\n  .sn-root,\n  .sn-mobile {\n    --sn-primary: #e6edf3;\n    --sn-secondary: #8b949e;\n    --sn-accent: #4d9fff;\n    --sn-hover-bg: rgba(255, 255, 255, 0.08);\n    --sn-bg: rgba(28, 31, 36, 0.55);\n    --sn-border: rgba(255, 255, 255, 0.14);\n  }\n}\n\n/* Web Component host\uFF1A\u81EA\u5B9A\u4E49\u5143\u7D20\u9ED8\u8BA4 display: inline\uFF08\u7C7B\u4F3C span\uFF09\uFF0C\n   \u4F1A\u88AB\u7236\u7EA7\u884C\u6846 / baseline / line-height \u5F71\u54CD\uFF0C\u5728\u4E0D\u540C\u5BBF\u4E3B\u5E03\u5C40\u91CC\u53EF\u80FD\n   \u4EA7\u751F\u5FAE\u5999\u5782\u76F4\u504F\u79FB\u3002\u8FD9\u91CC\u5F3A\u5236 block\uFF0C\u8BA9 host \u9AD8\u5EA6=\u5185\u5BB9\u9AD8\u5EA6\u3001\u5E03\u5C40\u66F4\u53EF\u63A7\u3002 */\n:host {\n  display: block;\n}\n\n.sn-root {\n  position: relative;\n  font-family: var(--sn-font-family);\n  /* \u4E0D\u786C\u7F16\u7801 color-scheme\uFF1A\u7EE7\u627F\u5BBF\u4E3B\u9875\u9762\u58F0\u660E\u7684\u914D\u8272\u65B9\u6848\u3002\n     \u5BBF\u4E3B\u58F0\u660E color-scheme: light / dark \u2192 \u7EC4\u4EF6\u5BF9\u5E94\u6D45\u8272 / \u6DF1\u8272\u4E3B\u9898\uFF1B\n     \u5BBF\u4E3B\u672A\u58F0\u660E \u2192 \u7EE7\u627F UA \u9ED8\u8BA4\uFF0C\u8DDF\u968F\u7CFB\u7EDF prefers-color-scheme\u3002 */\n  line-height: 1.5;\n}\n\n/* \u5E95\u90E8\u5206\u9694\u7EBF\uFF1A\u4F2A\u5143\u7D20\u6491\u6EE1\u6574\u4E2A\u89C6\u53E3\u5BBD\u5EA6\uFF08\u7EC4\u4EF6\u53EF\u80FD\u5D4C\u5728\u5E26\u5DE6\u53F3\u5185\u8FB9\u8DDD\u7684\n   \u5BB9\u5668\u91CC\uFF0C\u76F4\u63A5\u7528 border-bottom \u4F1A\u88AB\u5BB9\u5668\u5BBD\u5EA6\u9650\u5236\u3001\u5230\u4E0D\u4E86\u4E24\u8FB9\uFF09 */\n.sn-root::after {\n  content: "";\n  position: absolute;\n  bottom: -1px;\n  left: calc(50% - 50vw);\n  width: 100vw;\n  height: 1px;\n  background: var(--sn-border);\n  pointer-events: none;\n}\n\n.sn-root * {\n  box-sizing: border-box;\n}\n\n.sn-root a {\n  text-decoration: none;\n  -webkit-tap-highlight-color: transparent;\n}\n\n/* ==================== \u5BFC\u822A\u680F ==================== */\n\n.sn-bar {\n  position: relative;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  /* \u5DE6\u53F3\u7559\u767D\uFF1Alogo / \u5934\u50CF\u4E0D\u8D34\u89C6\u53E3\u8FB9\u7F18\uFF1B\u5E95\u90E8\u5206\u9694\u7EBF\u662F ::after \u4F2A\u5143\u7D20\uFF0C\n     \u4E0D\u53D7\u6B64 padding \u5F71\u54CD\uFF0C\u4F9D\u7136\u6491\u6EE1\u6574\u9875 */\n  padding: 0 var(--sn-pad-x);\n}\n\n/* \u54C1\u724C\u533A */\n.sn-brand {\n  display: flex;\n  align-items: center;\n  gap: 0.375rem;\n  padding: 0.375rem 0.5rem;\n  font-weight: 700;\n  font-size: 1rem;\n  color: var(--sn-primary);\n  white-space: nowrap;\n  transition: color 0.3s ease;\n}\n\n.sn-brand-icon {\n  display: inline-flex;\n  align-items: center;\n  font-size: 1.1em;\n  line-height: 1;\n}\n\n/* \u54C1\u724C\u56FE\u7247 logo\uFF08\u5706\u89D2\u65B9\u5F62\u3001\u56FA\u5B9A\u5C3A\u5BF8\u3001\u9632\u6B62\u62C9\u53D8\u5F62\uFF09\uFF1A\n * \u7528\u5706\u89D2\u65B9\u5F62\u800C\u975E\u5706\u5F62\uFF0C\u4E0E\u53F3\u4FA7\u5706\u5F62\u5934\u50CF\u5F62\u6210\u300C\u65B9 vs \u5706\u300D\u7684\u5BF9\u6BD4\uFF0C\n * \u907F\u514D\u5DE6\u53F3\u4E24\u4E2A\u5706\u5BF9\u79F0\u91CD\u590D */\n.sn-brand-img {\n  width: 1.8em;\n  height: 1.8em;\n  border-radius: 25%;\n  object-fit: cover;\n  display: block;\n}\n\n.sn-brand:hover {\n  color: var(--sn-accent);\n}\n\n/* \u94FE\u63A5\u7EC4\uFF1A\u7528\u7EDD\u5BF9\u5B9A\u4F4D\u5C45\u4E2D\u4E8E\u6574\u4E2A\u5BFC\u822A\u680F\uFF08\u89C6\u53E3\u4E2D\u5FC3\uFF09\uFF0C\n   \u4E0D\u518D\u53D7\u54C1\u724C / \u5934\u50CF\u5BBD\u5EA6\u4E0D\u5BF9\u79F0\u5F71\u54CD\uFF0C\u4E0E\u4E0B\u65B9\u9875\u9762\u5185\u5BB9\uFF08\u5982\u516C\u544A\uFF09\u4E2D\u5FC3\u7EBF\u5BF9\u9F50 */\n.sn-links {\n  position: absolute;\n  left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: var(--sn-gap);\n}\n\n.sn-link {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.375rem;\n  padding: 0.375rem 0.75rem;\n  border-radius: var(--sn-radius);\n  font-size: var(--sn-font-size);\n  font-weight: 500;\n  color: var(--sn-secondary);\n  white-space: nowrap;\n  transition: color 0.3s ease;\n}\n\n.sn-link-icon {\n  font-size: 1.1em;\n  line-height: 1;\n}\n\n/* hover \u4E0E\u5F53\u524D\u7AD9\u9AD8\u4EAE\u4E00\u81F4\uFF1A\u53EA\u505A\u6587\u5B57\u53D8\u8272\uFF0C\u4E0D\u52A0\u80CC\u666F */\n.sn-link:hover {\n  color: var(--sn-primary);\n}\n\n/* \u5F53\u524D\u7AD9\u9AD8\u4EAE\uFF1A\u53EA\u505A\u6587\u5B57\u53D8\u8272\uFF0C\u4E0D\u52A0\u80CC\u666F / \u63CF\u8FB9\u5708 */\n.sn-link.sn-active {\n  color: var(--sn-accent);\n}\n\n/* \u5934\u50CF\u533A\uFF1A\u56FA\u5B9A\u5C3A\u5BF8\u5BB9\u5668\uFF0C\u7EA6\u675F user-avatar \u7684\u5706\u5F62\u5934\u50CF\u4E0E\u5BFC\u822A\u680F\u534F\u8C03 */\n.sn-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: var(--sn-avatar-size);\n  height: var(--sn-avatar-size);\n  max-width: var(--sn-avatar-size);\n  max-height: var(--sn-avatar-size);\n  margin-left: auto;\n}\n\n/* ==================== \u79FB\u52A8\u7AEF hamburger ==================== */\n\n.sn-toggle {\n  display: none;\n  align-items: center;\n  justify-content: center;\n  width: 2.25rem;\n  height: 2.25rem;\n  padding: 0;\n  border: 1px solid var(--sn-border);\n  border-radius: var(--sn-radius);\n  background: transparent;\n  color: var(--sn-secondary);\n  cursor: pointer;\n  transition: background-color 0.3s ease, color 0.3s ease;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.sn-toggle:hover {\n  background: var(--sn-hover-bg);\n  color: var(--sn-primary);\n}\n\n.sn-toggle svg {\n  width: 1.25rem;\n  height: 1.25rem;\n}\n\n/* ==================== \u79FB\u52A8\u7AEF\u4E0B\u62C9\u83DC\u5355 ====================\n   Portal \u6A21\u5F0F\u4E0B\u6302\u5230 body\uFF08\u8131\u79BB shadow DOM\uFF09\uFF0C\u7531 JS \u5199\u5165\n   position: fixed + top/left/width\uFF0C\u7D27\u8D34\u5BFC\u822A\u680F\u4E0B\u65B9\u3002\n   CSS \u53EA\u8D1F\u8D23\u5916\u89C2\uFF1A\u73BB\u7483\u80CC\u666F\u3001\u9634\u5F71\u3001\u5C42\u53E0\u4E0A\u4E0B\u6587\u7B49\u3002\n   \u94FE\u63A5\u989C\u8272/\u53BB\u4E0B\u5212\u7EBF\u5FC5\u987B\u663E\u5F0F\u8BBE\u7F6E\uFF0C\u56E0\u4E3A .sn-root a \u9009\u62E9\u5668\n   \u53EA\u5BF9 shadow DOM \u5185\u7684 <a> \u751F\u6548\uFF0Cportal \u51FA\u53BB\u540E\u4E0D\u751F\u6548\u3002\n*/\n\n.sn-mobile {\n  /* \u5FC5\u987B\u59CB\u7EC8 fixed \u8131\u79BB\u6587\u6863\u6D41\uFF1A\n   * position \u4E0D\u80FD\u4F9D\u8D56 JS \u6253\u5F00\u65F6\u624D\u8BBE\u7F6E\uFF08\u5426\u5219\u5173\u95ED\u65F6\u56DE\u5230 static\uFF0C\n   * \u4F1A\u4EE5 display:flex \u5728 body \u672B\u5C3E\u6491\u51FA\u7A7A\u767D\uFF0C\u628A\u6B63\u5E38\u9875\u9762\u9876\u4E0B\u53BB\uFF09\u3002\n   * fixed \u8BA9\u5B83\u5728\u4EFB\u4F55\u65F6\u523B\u90FD\u4E0D\u53C2\u4E0E\u5E03\u5C40\uFF1Btop/left/right \u7531 JS \u6253\u5F00\u65F6\u5199\u5165\u3002 */\n  position: fixed;\n  top: 0;\n  left: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  padding: 0.5rem;\n  width: auto;\n  /* portal \u5230 body \u540E\u7EE7\u627F body \u7684 color-scheme\uFF08\u5BBF\u4E3B\u58F0\u660E light/dark\n     \u6216 UA \u9ED8\u8BA4\u8DDF\u968F\u7CFB\u7EDF\uFF09\uFF0Clight-dark() \u53D8\u91CF\u968F\u4E4B\u5207\u6362 */\n  background: light-dark(rgba(255, 255, 255, 0.94), rgba(24, 26, 32, 0.94));\n  border: 1px solid var(--sn-border);\n  border-radius: calc(var(--sn-radius) + 4px);\n  /* \u5F3A\u5316\u73BB\u7483\u6548\u679C\uFF1A\n   * 1. \u9AD8\u4E0D\u900F\u660E\u80CC\u666F\uFF080.94\uFF09\u907F\u514D\u4E0E\u6D45\u8272\u9875\u9762\u80CC\u666F\u878D\u5408"\u9690\u5F62"\n   * 2. saturate(180%) \u63D0\u5347\u80CC\u666F\u8272\u5F69\u9971\u548C\u5EA6\uFF0C\u73BB\u7483\u8D28\u611F\u66F4\u660E\u663E\n   * 3. isolation: isolate \u521B\u5EFA\u72EC\u7ACB\u5806\u53E0\u4E0A\u4E0B\u6587\uFF0C\u9632\u6B62 backdrop-filter \u5728\n   *    transform / contain \u7956\u5148\u4E0B\u6E32\u67D3\u8FB9\u754C\u5F02\u5E38\n   * 4. translateZ(0) \u89E6\u53D1\u72EC\u7ACB GPU \u5408\u6210\u5C42 */\n  backdrop-filter: saturate(180%) blur(20px);\n  -webkit-backdrop-filter: saturate(180%) blur(20px);\n  box-shadow:\n    0 16px 48px rgba(15, 23, 42, 0.18),\n    0 4px 12px rgba(15, 23, 42, 0.08),\n    inset 0 1px 0 light-dark(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.08));\n  isolation: isolate;\n  transform: translateY(-8px) translateZ(0);\n  z-index: 11000;\n  /* \u9ED8\u8BA4\u72B6\u6001\uFF1A\u900F\u660E + \u9690\u85CF\uFF0C\u4E3A\u6253\u5F00\u52A8\u753B\u51C6\u5907 */\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n  transform-origin: top right;\n  transition:\n    opacity 0.18s ease,\n    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),\n    visibility 0.18s ease;\n}\n\n.sn-mobile.sn-open {\n  opacity: 1;\n  visibility: visible;\n  transform: translateY(0) translateZ(0);\n  /* \u6CE8\u610F\uFF1A\u5185\u8054 top/left/width \u7531 JS \u5728 updateMobilePosition \u4E2D\u5199\u5165\uFF0C\n     \u6B64\u5904 transform \u4EC5\u505A\u4F4D\u79FB\uFF0C\u4E0D\u8986\u76D6 position */\n  pointer-events: auto;\n}\n\n/* portal \u51FA\u53BB\u7684\u94FE\u63A5\u5FC5\u987B\u72EC\u7ACB\u8BBE\u7F6E\u989C\u8272\u548C\u53BB\u4E0B\u5212\u7EBF\uFF0C\n   \u56E0\u4E3A .sn-root a \u9009\u62E9\u5668\u53EA\u5BF9 shadow DOM \u5185\u7684 <a> \u751F\u6548 */\n.sn-mobile .sn-link {\n  display: flex;\n  align-items: center;\n  gap: 0.625rem;\n  width: 100%;\n  padding: 0.75rem 1rem;\n  border-radius: calc(var(--sn-radius) - 2px);\n  font-size: 0.9375rem;\n  font-weight: 500;\n  color: var(--sn-secondary);\n  text-decoration: none;\n  white-space: nowrap;\n  transition:\n    color 0.2s ease,\n    transform 0.2s ease;\n}\n\n.sn-mobile .sn-link-icon {\n  font-size: 1.05em;\n  line-height: 1;\n  width: 1.25em;\n  text-align: center;\n  flex-shrink: 0;\n}\n\n/* hover \u4E0E\u5F53\u524D\u7AD9\u9AD8\u4EAE\u4E00\u81F4\uFF1A\u53EA\u505A\u6587\u5B57\u53D8\u8272\uFF0C\u4E0D\u52A0\u80CC\u666F */\n.sn-mobile .sn-link:hover {\n  color: var(--sn-primary);\n}\n\n/* \u6309\u538B\u53CD\u9988\u53EA\u4FDD\u7559\u8F7B\u5FAE\u7F29\u653E\uFF0C\u4E0D\u52A0\u80CC\u666F */\n.sn-mobile .sn-link:active {\n  transform: scale(0.98);\n}\n\n/* \u5F53\u524D\u7AD9\u9AD8\u4EAE\uFF1A\u4E0E\u684C\u9762\u7AEF\u4E00\u81F4\uFF0C\u53EA\u505A\u6587\u5B57\u53D8\u8272 */\n.sn-mobile .sn-link.sn-active {\n  color: var(--sn-accent);\n}\n\n/* ==================== \u54CD\u5E94\u5F0F ==================== */\n\n@media (max-width: 768px) {\n  .sn-links {\n    display: none;\n  }\n  .sn-toggle {\n    display: inline-flex;\n  }\n}\n';

  // src/utils.ts
  function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escapeAttr(value) {
    return escapeHtml(value);
  }
  function normalizeHost(host) {
    return host.replace(/^www\./i, "");
  }
  function matchCurrentHost(href) {
    try {
      const linkHost = normalizeHost(new URL(href, window.location.href).hostname);
      const currentHost = normalizeHost(window.location.hostname);
      if (!linkHost || !currentHost) return null;
      if (linkHost === currentHost) return "exact";
      if (currentHost.endsWith("." + linkHost)) return "sub";
      return null;
    } catch {
      return null;
    }
  }
  var HAMBURGER_ICON = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M2 5a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>';
  var CLOSE_ICON = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>';

  // src/wx-auth-bootstrap.ts
  var DEFAULT_SDK_SRC = "https://unpkg.com/wx-auth-sdk@latest/dist/wx-auth.umd.js";
  var bootstrapPromise = null;
  var initialized = false;
  function getWindowSdk() {
    if (typeof window === "undefined") return void 0;
    return window.WxAuth;
  }
  function ensureWxAuth(options = {}) {
    const {
      src = DEFAULT_SDK_SRC,
      enabled = true,
      initOptions = { silent: true, required: false },
      pollInterval = 100,
      timeout = 1e4,
      onReady,
      onError
    } = options;
    if (!enabled) return Promise.resolve(false);
    const existing = getWindowSdk();
    if (existing) {
      onReady == null ? void 0 : onReady(existing);
      return Promise.resolve(true);
    }
    if (!bootstrapPromise) {
      bootstrapPromise = new Promise((resolve) => {
        injectSdkScript(src);
        const started = Date.now();
        const timer = setInterval(() => {
          const sdk = getWindowSdk();
          if (sdk) {
            clearInterval(timer);
            if (!initialized && typeof sdk.init === "function") {
              try {
                sdk.init(initOptions);
                initialized = true;
              } catch (e) {
                console.warn("[site-navbar] WxAuth.init \u8C03\u7528\u5931\u8D25", e);
              }
            }
            onReady == null ? void 0 : onReady(sdk);
            resolve(true);
          } else if (Date.now() - started > timeout) {
            clearInterval(timer);
            const reason = `wx-auth-sdk \u52A0\u8F7D\u8D85\u65F6\uFF08${timeout}ms\uFF09`;
            console.warn(`[site-navbar] ${reason}\uFF0C\u5934\u50CF\u767B\u5F55\u529F\u80FD\u4E0D\u53EF\u7528\uFF0C\u5BFC\u822A\u680F\u7167\u5E38\u6E32\u67D3`);
            onError == null ? void 0 : onError(reason);
            resolve(false);
          }
        }, pollInterval);
      });
    }
    return bootstrapPromise;
  }
  function injectSdkScript(src) {
    if (typeof document === "undefined") return;
    const existing = Array.from(document.querySelectorAll("script[data-wx-auth-sdk]"));
    if (existing.some((s) => s.src === src)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-wx-auth-sdk", "");
    script.onerror = () => {
      console.warn(`[site-navbar] wx-auth-sdk \u52A0\u8F7D\u5931\u8D25\uFF1A${src}\uFF0C\u5934\u50CF\u529F\u80FD\u4E0D\u53EF\u7528\uFF0C\u5BFC\u822A\u680F\u7167\u5E38\u6E32\u67D3`);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // src/SiteNavbar.ts
  var DEFAULT_LINKS = [
    { href: "https://www.shenzjd.com", label: "AI\u60C5\u62A5\u5C40", icon: "\u{1F3E0}" },
    { href: "https://panhub.shenzjd.com", label: "\u7F51\u76D8\u641C\u7D22", icon: "\u{1F50D}" },
    { href: "https://h5.lot-ml.com/ProductEn/Index/3d58b4cfe8b560c8", label: "\u6D41\u91CF\u5361", icon: "\u{1F4F6}" },
    // { href: 'https://newshub.shenzjd.com', label: '热点聚合', icon: '📰' },
    { href: "https://tvbox.shenzjd.com/", label: "TVbox \u63A5\u53E3", icon: "\u{1F4FA}" },
    { href: "https://navhub.shenzjd.com", label: "\u5BFC\u822A\u68EE\u6797", icon: "\u{1F9ED}" },
    { href: "https://jietingche.shenzjd.com/", label: "\u505C\u8F66\u6708\u5361", icon: "\u{1F17F}\uFE0F" },
    { href: "https://portfolio.shenzjd.com/products", label: "\u66F4\u591A", icon: "\u2728" }
  ];
  var DEFAULT_BRAND = {
    icon: '<img class="sn-brand-img" src="https://cdn.jsdmirror.com/gh/wu529778790/img.shenzjd.com@master/blog/imgx-20260701-180125-c1ub.webp" alt="\u795E\u65CF\u4E5D\u5E1D" />',
    text: "\u795E\u65CF\u4E5D\u5E1D"
  };
  var AVATAR_DEFAULT_SIZE = "2.2rem";
  var AVATAR_TAG = "user-avatar";
  var AVATAR_WC_SRC = "https://unpkg.com/@wu529778790/user-avatar@latest/dist/user-avatar.wc.js";
  var AVATAR_LOAD_TIMEOUT = 15e3;
  var avatarWcPromise = null;
  function ensureUserAvatarElement(src) {
    if (customElements.get(AVATAR_TAG)) return Promise.resolve(true);
    if (!avatarWcPromise) {
      avatarWcPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src || AVATAR_WC_SRC;
        script.async = true;
        script.onload = () => {
          const defined = customElements.whenDefined(AVATAR_TAG).then(
            () => true,
            () => false
          );
          const timeout = new Promise((r) => setTimeout(() => r(false), AVATAR_LOAD_TIMEOUT));
          void Promise.race([defined, timeout]).then(resolve);
        };
        script.onerror = () => resolve(false);
        (document.head || document.documentElement).appendChild(script);
      });
    }
    return avatarWcPromise.then((ok) => {
      if (!ok) avatarWcPromise = null;
      return ok;
    });
  }
  var DEFAULT_THEME = {
    primary: "light-dark(#1f2328, #e6edf3)",
    secondary: "light-dark(#656d76, #8b949e)",
    accent: "light-dark(#1a6dff, #4d9fff)",
    hoverBg: "light-dark(rgba(31, 35, 40, 0.06), rgba(255, 255, 255, 0.08))",
    bg: "light-dark(rgba(255, 255, 255, 0.55), rgba(28, 31, 36, 0.55))",
    border: "light-dark(rgba(27, 31, 36, 0.14), rgba(255, 255, 255, 0.14))",
    radius: "12px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  };
  var SiteNavbar = class {
    constructor(options = {}, container = document.body) {
      /** <user-avatar> 元素（脚本就绪后自动升级渲染；卸载时直接 remove） */
      this.avatarEl = null;
      this.toggleEl = null;
      this.mobileEl = null;
      this.mobileOpen = false;
      /** 点击导航栏外部关闭移动菜单 */
      this.onDocClick = (e) => {
        if (!this.mobileOpen) return;
        const target = e.target;
        if (!this.root.contains(target) && !(this.mobileEl && this.mobileEl.contains(target))) {
          this.setMobileOpen(false);
        }
      };
      /** Esc 关闭移动菜单 */
      this.onKeyDown = (e) => {
        if (e.key === "Escape" && this.mobileOpen) {
          this.setMobileOpen(false);
        }
      };
      /** 视口超过断点时收起移动菜单 + 滚动时实时更新菜单位置 */
      this.onResize = () => {
        if (this.mobileOpen && window.innerWidth > this.opts.breakpoint) {
          this.setMobileOpen(false);
        }
      };
      /** 页面滚动时实时更新菜单 fixed 位置，避免菜单与导航栏脱节 */
      this.onScroll = () => {
        if (this.mobileOpen) {
          this.updateMobilePosition();
        }
      };
      this.container = container;
      this.opts = this.resolve(options);
      this.root = document.createElement("div");
      this.root.className = "sn-root";
    }
    /** 环境检查：头像 SDK 缺失时返回提示（不影响导航本体渲染） */
    static check() {
      const Ctor = customElements.get(AVATAR_TAG);
      if (Ctor && typeof Ctor.check === "function") return Ctor.check();
      const sdk = window.WxAuth;
      return sdk ? null : "\u672A\u68C0\u6D4B\u5230\u5FAE\u4FE1\u8BA4\u8BC1 SDK\uFF08window.WxAuth\uFF09\uFF0C\u8BF7\u5148\u5F15\u5165 wx-auth-sdk \u5E76\u8C03\u7528 WxAuth.init()";
    }
    /** 挂载到页面 */
    mount(target) {
      if (this.root.isConnected) return this;
      if (target) {
        target.appendChild(this.root);
      } else if (this.container instanceof ShadowRoot) {
        this.container.appendChild(this.root);
      } else if (this.container === document.body) {
        document.body.appendChild(this.root);
      } else {
        this.container.appendChild(this.root);
      }
      this.applyTheme();
      this.render();
      void ensureWxAuth(this.opts.wxAuth);
      return this;
    }
    /** 卸载并销毁 */
    unmount() {
      this.destroy();
    }
    destroy() {
      var _a;
      (_a = this.avatarEl) == null ? void 0 : _a.remove();
      this.avatarEl = null;
      if (this.mobileEl && this.mobileEl.parentElement) {
        this.mobileEl.parentElement.removeChild(this.mobileEl);
      }
      this.mobileEl = null;
      document.removeEventListener("click", this.onDocClick);
      document.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("resize", this.onResize);
      window.removeEventListener("scroll", this.onScroll, true);
      this.root.remove();
    }
    // ==================== 初始化 ====================
    resolve(options) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      return {
        links: (_a = options.links) != null ? _a : DEFAULT_LINKS,
        brand: (_b = options.brand) != null ? _b : DEFAULT_BRAND,
        avatar: (_c = options.avatar) != null ? _c : true,
        // 头像内嵌导航栏：fixed 必须为 false；size 同步写入 theme，避免 user-avatar
        // 内 opts.theme.size 不与 options.size 同步时只取 DEFAULT 的坑
        avatarOptions: {
          size: AVATAR_DEFAULT_SIZE,
          ...(_d = options.avatarOptions) != null ? _d : {},
          theme: {
            size: AVATAR_DEFAULT_SIZE,
            ...(_f = (_e = options.avatarOptions) == null ? void 0 : _e.theme) != null ? _f : {}
          },
          fixed: false
        },
        theme: { ...DEFAULT_THEME, ...(_g = options.theme) != null ? _g : {} },
        breakpoint: (_h = options.breakpoint) != null ? _h : 768,
        portalEl: (_i = options.portalEl) != null ? _i : document.body,
        onNavigate: options.onNavigate,
        wxAuth: (_j = options.wxAuth) != null ? _j : {}
      };
    }
    applyTheme() {
      const t = this.opts.theme;
      const s = this.root.style;
      s.setProperty("--sn-primary", t.primary);
      s.setProperty("--sn-secondary", t.secondary);
      s.setProperty("--sn-accent", t.accent);
      s.setProperty("--sn-hover-bg", t.hoverBg);
      s.setProperty("--sn-bg", t.bg);
      s.setProperty("--sn-border", t.border);
      s.setProperty("--sn-radius", t.radius);
      s.setProperty("--sn-font-family", t.fontFamily);
    }
    // ==================== 渲染 ====================
    render() {
      this.root.innerHTML = "";
      const activeHref = this.computeActiveHref();
      const bar = document.createElement("div");
      bar.className = "sn-bar";
      if (this.opts.brand) {
        bar.appendChild(this.renderBrand(this.opts.brand));
      }
      const nav = document.createElement("nav");
      nav.className = "sn-links";
      for (const link of this.opts.links) {
        nav.appendChild(this.renderLink(link, link.href === activeHref));
      }
      bar.appendChild(nav);
      if (this.opts.avatar) {
        const host = document.createElement("div");
        host.className = "sn-avatar";
        bar.appendChild(host);
        const el = document.createElement(AVATAR_TAG);
        const { src, ...avatarOptions } = this.opts.avatarOptions;
        el.props = avatarOptions;
        host.appendChild(el);
        this.avatarEl = el;
        void ensureUserAvatarElement(src).then((ok) => {
          if (!ok) {
            console.warn(
              `[site-navbar] <user-avatar> \u52A0\u8F7D\u5931\u8D25\uFF0C\u5934\u50CF\u672A\u6E32\u67D3\uFF1A${src || AVATAR_WC_SRC}`
            );
          }
        });
      }
      const toggle = document.createElement("button");
      toggle.className = "sn-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", "\u83DC\u5355");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = HAMBURGER_ICON;
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.setMobileOpen(!this.mobileOpen);
      });
      bar.appendChild(toggle);
      this.toggleEl = toggle;
      this.root.appendChild(bar);
      const mobile = document.createElement("div");
      mobile.className = "sn-mobile";
      mobile.setAttribute("role", "menu");
      mobile.setAttribute("aria-hidden", "true");
      for (const link of this.opts.links) {
        mobile.appendChild(this.renderLink(link, link.href === activeHref));
      }
      const portalStyle = document.createElement("style");
      portalStyle.setAttribute("data-sn-portal-styles", "");
      portalStyle.textContent = styles_default;
      mobile.appendChild(portalStyle);
      this.opts.portalEl.appendChild(mobile);
      this.mobileEl = mobile;
      document.addEventListener("click", this.onDocClick);
      document.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("resize", this.onResize);
      window.addEventListener("scroll", this.onScroll, true);
    }
    renderBrand(brand) {
      var _a;
      const a = document.createElement("a");
      a.className = "sn-brand";
      const href = (_a = brand.href) != null ? _a : window.location.origin;
      a.href = escapeAttr(href);
      try {
        if (new URL(href, window.location.href).origin === window.location.origin) {
          a.target = "_self";
        } else {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
      } catch {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      if (brand.icon) {
        const icon = document.createElement("span");
        icon.className = "sn-brand-icon";
        icon.innerHTML = brand.icon;
        a.appendChild(icon);
      }
      if (brand.text) {
        a.appendChild(document.createTextNode(brand.text));
      }
      return a;
    }
    renderLink(link, active) {
      const a = document.createElement("a");
      a.className = "sn-link";
      a.href = escapeAttr(link.href);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      if (active) a.classList.add("sn-active");
      a.setAttribute("aria-current", active ? "page" : "false");
      if (link.icon) {
        const icon = document.createElement("span");
        icon.className = "sn-link-icon";
        icon.innerHTML = link.icon;
        a.appendChild(icon);
      }
      a.appendChild(document.createTextNode(link.label));
      a.addEventListener("click", (e) => {
        var _a, _b;
        return (_b = (_a = this.opts).onNavigate) == null ? void 0 : _b.call(_a, link, e);
      });
      return a;
    }
    /**
     * 计算当前应高亮的链接：
     * 1. 链接显式 active: true 强制高亮（优先于自动匹配，active: false 永不自动高亮）；
     * 2. 否则按 host 精确匹配当前站（归一化 www 后完全相等）；
     * 3. 匹配不上就都不高亮——不做「子域回退高亮主站」，避免访问未收录的
     *    子域站时误亮主站链接。
     */
    computeActiveHref() {
      for (const link of this.opts.links) {
        if (link.active === true) return link.href;
      }
      for (const link of this.opts.links) {
        if (link.active === false) continue;
        if (matchCurrentHost(link.href) === "exact") return link.href;
      }
      return null;
    }
    // ==================== 移动端菜单交互 ====================
    setMobileOpen(open) {
      this.mobileOpen = open;
      if (this.mobileEl) {
        this.mobileEl.classList.toggle("sn-open", open);
        this.mobileEl.setAttribute("aria-hidden", String(!open));
        if (open) {
          this.updateMobilePosition();
        }
      }
      if (this.toggleEl) {
        this.toggleEl.setAttribute("aria-expanded", String(open));
        this.toggleEl.innerHTML = open ? CLOSE_ICON : HAMBURGER_ICON;
      }
    }
    /**
     * 根据导航栏根节点（.sn-root）的视口位置更新 portal 菜单的 fixed 定位。
     * 菜单左右铺满视口（两侧各留 16px 边距），给人饱满、大气的观感，
     * 比紧贴导航栏宽度的细长菜单更耐看。
     * position: fixed + top/left/right 确保菜单紧贴导航栏下方并铺满左右，
     * 不受祖先 backdrop-filter / transform / sticky 等影响绘制边界。
     */
    updateMobilePosition() {
      if (!this.mobileEl) return;
      const rect = this.root.getBoundingClientRect();
      const s = this.mobileEl.style;
      s.position = "fixed";
      s.top = `${Math.round(rect.bottom + 8)}px`;
      s.left = "16px";
      s.right = "16px";
      s.width = "auto";
    }
  };

  // src/web-component.ts
  var TAG = "site-navbar";
  var GLOBAL_KEY = "__SITE_NAVBAR_OPTIONS__";
  function readGlobal() {
    return window[GLOBAL_KEY];
  }
  function boolAttr(el, name, fallback) {
    const v = el.getAttribute(name);
    if (v === null) return fallback;
    return v === "" || v === "true" || v === "1";
  }
  var THEME_ATTRS = [
    ["theme-primary", "primary"],
    ["theme-secondary", "secondary"],
    ["theme-accent", "accent"],
    ["theme-hover-bg", "hoverBg"],
    ["theme-bg", "bg"],
    ["theme-border", "border"],
    ["theme-radius", "radius"],
    ["theme-font-family", "fontFamily"]
  ];
  var SiteNavbarElement = class extends HTMLElement {
    constructor() {
      super();
      this.widget = null;
      this.shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = styles_default;
      this.shadow.appendChild(style);
    }
    static get observedAttributes() {
      return [
        "brand",
        "brand-icon",
        "avatar",
        "avatar-src",
        "links",
        "wx-auth-enabled",
        ...THEME_ATTRS.map(([attr]) => attr)
      ];
    }
    connectedCallback() {
      this.mountWidget();
    }
    disconnectedCallback() {
      var _a;
      (_a = this.widget) == null ? void 0 : _a.unmount();
      this.widget = null;
    }
    attributeChangedCallback() {
      if (this.isConnected) {
        this.mountWidget();
      }
    }
    mountWidget() {
      var _a;
      (_a = this.widget) == null ? void 0 : _a.unmount();
      this.widget = new SiteNavbar(this.buildOptions(), this.shadow);
      this.widget.mount();
    }
    buildOptions() {
      var _a, _b, _c, _d;
      const global = (_a = readGlobal()) != null ? _a : {};
      const get = (name) => this.getAttribute(name);
      const theme = {};
      for (const [attr, key] of THEME_ATTRS) {
        const v = get(attr);
        if (v !== null) theme[key] = v;
      }
      let brand = global.brand;
      const brandAttr = get("brand");
      if (brandAttr !== null) {
        brand = { ...(_b = global.brand) != null ? _b : {}, text: brandAttr };
      }
      const brandIcon = get("brand-icon");
      if (brandIcon !== null) {
        brand = { ...brand != null ? brand : {}, icon: brandIcon };
      }
      let links = global.links;
      const linksAttr = get("links");
      if (linksAttr !== null) {
        try {
          const parsed = JSON.parse(linksAttr);
          if (Array.isArray(parsed)) links = parsed;
        } catch {
        }
      }
      let avatarOptions = global.avatarOptions;
      const avatarSrc = get("avatar-src");
      if (avatarSrc !== null) {
        avatarOptions = { ...avatarOptions != null ? avatarOptions : {}, src: avatarSrc };
      }
      let wxAuth = global.wxAuth;
      const wxAuthEnabled = get("wx-auth-enabled");
      if (wxAuthEnabled !== null) {
        wxAuth = { ...wxAuth != null ? wxAuth : {}, enabled: boolAttr(this, "wx-auth-enabled", true) };
      }
      return {
        ...global,
        links,
        brand,
        avatar: boolAttr(this, "avatar", (_c = global.avatar) != null ? _c : true),
        avatarOptions,
        wxAuth,
        theme: { ...(_d = global.theme) != null ? _d : {}, ...theme },
        onNavigate: global.onNavigate
      };
    }
  };
  function injectPlaceholder() {
    const id = `data-sn-placeholder`;
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `${TAG}:not(:defined) {
  display: block;
  height: var(--sn-navbar-height, 44px);
  box-sizing: border-box;
}`;
    (document.head || document.documentElement).appendChild(style);
  }
  if (!customElements.get(TAG)) {
    injectPlaceholder();
    customElements.define(TAG, SiteNavbarElement);
  }
})();
