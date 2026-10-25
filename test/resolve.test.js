import test from "node:test";
import assert from "node:assert/strict";
import { baseNameOf, iconIdFor } from "../src/resolve.js";

const table = {
  file: "file_text",
  names: { "package.json": "file_package", ".gitignore": "file_gitignore" },
  ext: [[".test.ts", "file_testts"], [".ts", "file_ts"], [".tsx", "file_tsx"], [".md", "file_md"]]
};

test("baseNameOf strips directories and line suffixes", () => {
  assert.equal(baseNameOf("C:\\repo\\src\\client.js"), "client.js");
  assert.equal(baseNameOf("dsh-icon/src/client.js:31-45"), "client.js");
  assert.equal(baseNameOf("a.ts:12"), "a.ts");
  assert.equal(baseNameOf(""), "");
});

test("iconIdFor prefers file names, then the longest extension", () => {
  assert.equal(iconIdFor("package.json", table), "file_package");
  assert.equal(iconIdFor("README.md", table), "file_md");
  assert.equal(iconIdFor("client.test.ts", table), "file_testts");
  assert.equal(iconIdFor("client.ts", table), "file_ts");
  assert.equal(iconIdFor("unknown.bin", table), "file_text");
  assert.equal(iconIdFor("", table), "file_text");
});
