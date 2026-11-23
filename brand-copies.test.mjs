// D-0060 (chanwe-brandbook): this app keeps no look of its own. Its stylesheets are copies of the brandbook's
// brand/ui/apps/* (its brand:sync writes them; its brand:check fails on a stale one) and say so on their first line.
// A new stylesheet is written in the brandbook and listed in its consumers.json. Run: node --test brand-copies.test.mjs
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const COPIES = {
  "src/app/chanwe-theme.css": "ui/apps/umami.css",
  "src/app/chanwe-web-navigation.css": "ui/apps/umami-web-navigation.css"
};
const KNOWN = ["src/app/chanwe-theme.css", "src/app/chanwe-web-navigation.css", "src/app/global.css"];

test("each stylesheet is the brandbook's copy", () => {
  for (const [path, hub] of Object.entries(COPIES)) {
    const first = readFileSync(join(root, path), "utf8").split("\n", 1)[0];
    assert.equal(first, `/* Written in chanwe-brandbook (brand/${hub}) and copied here by its brand:sync (D-0060). Never edit this copy. */`, path);
  }
});

test("no stylesheet was added beside them", () => {
  const dirs = [...new Set(Object.keys(COPIES).map((p) => dirname(p)))];
  const found = dirs.flatMap((d) => readdirSync(join(root, d)).filter((f) => f.endsWith(".css")).map((f) => join(d, f))).sort();
  assert.deepEqual(found, KNOWN, "write a new stylesheet in chanwe-brandbook (brand/ui/apps) and list it in its consumers.json");
});
