// Turns assets/jetbrains/{dark,light}.json + icons/*.svg into lib/client.js.
// Usage: node scripts/build-icons.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const assets = path.join(root, "assets", "jetbrains");
const THEMES = [["jetbrains-dark", "dark.json"], ["jetbrains-light", "light.json"]];

const data = {};
for (const [id, manifest] of THEMES) {
  const theme = JSON.parse(fs.readFileSync(path.join(assets, manifest), "utf8"));
  const names = {};
  for (const [name, iconId] of Object.entries(theme.fileNames || {})) names[name.toLowerCase()] = iconId;
  const ext = Object.entries(theme.fileExtensions || {})
    .map(([extension, iconId]) => ["." + extension.toLowerCase(), iconId])
    .sort((a, b) => b[0].length - a[0].length);
  // Only inline icons the tool rows can actually resolve to; folder icons are dead weight here.
  const used = new Set([theme.file, ...Object.values(names), ...ext.map(([, iconId]) => iconId)]);
  const icons = {};
  for (const iconId of used) {
    const def = theme.iconDefinitions[iconId];
    if (!def) continue;
    const svg = fs.readFileSync(path.join(assets, "icons", path.basename(def.iconPath)));
    icons[iconId] = svg.toString("base64");
  }
  data[id] = { icons, names, ext, file: theme.file };
}

const resolver = fs
  .readFileSync(path.join(root, "src", "resolve.js"), "utf8")
  .replace(/^export /gm, "");

const template = fs.readFileSync(path.join(root, "src", "client.js"), "utf8");
const output = template
  .replace("/* __RESOLVER__ */", resolver.trim())
  .replace("/* __ICON_DATA__ */ {}", JSON.stringify(data));

fs.writeFileSync(path.join(root, "lib", "client.js"), output);
console.log("lib/client.js", (Buffer.byteLength(output) / 1024).toFixed(1) + " KB");
