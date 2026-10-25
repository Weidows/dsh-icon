// Smoke test: the generated bundle must register, install, decorate a file-link row,
// and emit a data-URI rule without touching React's tree.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function loadBundle() {
  const elements = [];
  const style = { id: "", textContent: "", remove() {} };
  const row = {
    textContent: "dsh-icon/src/client.js:12-30",
    attrs: {},
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; }
  };
  const head = { appendChild(el) { elements.push(el); } };
  globalThis.document = {
    body: {},
    head,
    createElement() { return style; },
    querySelectorAll(selector) { return selector === "[class*=\"_fileLink\"]" || selector === "[data-dsh-icon]" ? [row] : []; }
  };
  globalThis.localStorage = { getItem: () => null, setItem() {} };
  globalThis.MutationObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};
  let registered;
  globalThis.window = { __ModuleLoader__: { load: (mod) => { registered = mod; } } };

  const source = fs.readFileSync(path.join(root, "lib", "client.js"), "utf8");
  new Function(source)();
  const plugin = registered.factory((name) => {
    if (name === "react") return { createElement: () => null, useState: (v) => [v, () => {}] };
    throw new Error("unexpected require: " + name);
  });
  const effects = [];
  const panels = [];
  const slots = { inject: (name, fn) => fn(), register: (def, component) => { panels.push(component); return { def, component }; } };
  plugin.apply({ effect: (fn) => effects.push(fn()), get: () => slots });

  return { plugin, row, style, effects, panels };
}

test("bundle registers, decorates file rows and emits icon css", () => {
  const { plugin, row, style, effects, panels } = loadBundle();
  assert.equal(plugin.inject[0], "slots");
  assert.match(row.attrs["data-dsh-icon"], /^file_/);
  assert.match(style.textContent, /data:image\/svg\+xml;base64,/);
  assert.ok(style.textContent.includes('[data-dsh-icon="' + row.attrs["data-dsh-icon"] + '"]'), "icon has a css rule");
  assert.equal(effects.length, 1, "uninstall effect registered");
  effects[0]();
  assert.equal(row.attrs["data-dsh-icon"], undefined, "effect removes the attribute");
  assert.equal(panels.length, 1, "settings panel registered");
  assert.doesNotThrow(() => panels[0](), "settings panel renders");
});
