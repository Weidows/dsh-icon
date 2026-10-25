// dsh-icon client bundle template. Edit this file, then run: node scripts/build-icons.mjs
// The generated lib/client.js replaces __RESOLVER__ and __ICON_DATA__.
(function () {
  "use strict";

  /* __RESOLVER__ */

  var ICONS = /* __ICON_DATA__ */ {};
  var STORE_KEY = "dsh-icon.theme";
  var DEFAULT_THEME = "jetbrains-dark";
  var ATTR = "data-dsh-icon";
  var STYLE_ID = "dsh-icon-style";
  var OPTIONS = [["jetbrains-dark", "JetBrains 暗色"], ["jetbrains-light", "JetBrains 亮色"], ["off", "关闭"]];
  var BASE_CSS = "[data-dsh-icon]::before{content:\"\";display:inline-block;width:1em;height:1em;margin-right:5px;vertical-align:-0.15em;background-position:center;background-repeat:no-repeat;background-size:contain}";

  var listeners = [];
  var state = { theme: readTheme() };

  function readTheme() {
    try {
      var stored = localStorage.getItem(STORE_KEY);
      return stored === "off" || ICONS[stored] ? stored : DEFAULT_THEME;
    } catch (error) {
      return DEFAULT_THEME;
    }
  }

  function setTheme(theme) {
    try { localStorage.setItem(STORE_KEY, theme); } catch (error) { /* private mode */ }
    state.theme = theme;
    for (var i = 0; i < listeners.length; i++) listeners[i]();
  }

  function themeCss() {
    var theme = ICONS[state.theme];
    if (!theme) return "";
    var parts = [BASE_CSS];
    for (var id in theme.icons) {
      parts.push("[" + ATTR + "=\"" + id + "\"]::before{background-image:url(\"data:image/svg+xml;base64," + theme.icons[id] + "\")}");
    }
    return parts.join("\n");
  }

  function decorate() {
    var theme = ICONS[state.theme];
    if (!theme) return;
    var rows = document.querySelectorAll("[class*=\"_fileLink\"]");
    for (var i = 0; i < rows.length; i++) {
      rows[i].setAttribute(ATTR, iconIdFor(baseNameOf(rows[i].textContent), theme));
    }
  }

  function install(ctx) {
    var style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
    var refresh = function () {
      style.textContent = themeCss();
      decorate();
    };
    listeners.push(refresh);
    refresh();
    var frame = 0;
    var observer = new MutationObserver(function () {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        decorate();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    if (ctx && typeof ctx.effect === "function") {
      ctx.effect(function () {
        return function () {
          observer.disconnect();
          if (frame) cancelAnimationFrame(frame);
          var index = listeners.indexOf(refresh);
          if (index >= 0) listeners.splice(index, 1);
          style.remove();
          document.querySelectorAll("[" + ATTR + "]").forEach(function (el) { el.removeAttribute(ATTR); });
        };
      });
    }
  }

  // React/h only exist inside the factory, so the panel is built there.
  function makeSettingsPanel(React, h) {
    return function SettingsPanel() {
    var pair = React.useState(state.theme);
    var theme = pair[0];
    var setLocal = pair[1];
    return h("div", { style: { display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0" } }, [
      h("div", { key: "row", style: { display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" } }, [
        h("span", { key: "label" }, "主题"),
        h("select", {
          key: "select",
          value: theme,
          onChange: function (event) { setLocal(event.target.value); setTheme(event.target.value); },
          style: { padding: "3px 6px", color: "inherit", background: "transparent", border: "1px solid currentColor", borderRadius: "4px" }
        }, OPTIONS.map(function (option) {
          return h("option", { key: option[0], value: option[0] }, option[1]);
        }))
      ]),
      h("div", { key: "hint", style: { fontSize: "12px", opacity: 0.6, lineHeight: 1.6 } },
        "在工具调用行的文件路径前显示文件类型图标（读 / 写 / 编辑）。图标主题来自 fogio-org/vscode-jetbrains-file-icon-theme，图标版权归 JetBrains s.r.o.（Apache-2.0）。")
    ]);
    };
  }

  window.__ModuleLoader__.load({
    id: "@weidows/dsh-icon",
    factory: function (require) {
      var React = require("react");
      var h = React.createElement;
      return {
        inject: ["slots"],
        apply: function (ctx) {
          if (!document.body) {
            document.addEventListener("DOMContentLoaded", function () { install(ctx); }, { once: true });
          } else {
            install(ctx);
          }
          var slots = ctx && (typeof ctx.get === "function" ? ctx.get("slots") : undefined) || (ctx && ctx.slots);
          if (!slots || typeof slots.inject !== "function") return;
          slots.inject("settings.section", function () {
            return slots.register({ name: "settings.section", id: "dsh-icon", order: 60, label: "文件图标" }, makeSettingsPanel(React, h));
          });
        }
      };
    }
  });
})();
