// Pure path -> icon-id helpers. Imported by the test; inlined into the client bundle by
// scripts/build-icons.mjs (which strips the "export " keywords).

export function baseNameOf(text) {
  var t = String(text == null ? "" : text).trim();
  t = t.replace(/(?::\d+(?:[-\u2013]\d+)?)+$/, "");
  var parts = t.split(/[\\/]/);
  return parts[parts.length - 1] || "";
}

export function iconIdFor(baseName, table) {
  if (!baseName) return table.file;
  var low = baseName.toLowerCase();
  var named = table.names[low];
  if (named) return named;
  for (var i = 0; i < table.ext.length; i++) {
    if (low.endsWith(table.ext[i][0])) return table.ext[i][1];
  }
  return table.file;
}
