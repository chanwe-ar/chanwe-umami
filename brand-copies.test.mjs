// D-0060 (chanwe-brandbook): this app keeps no look of its own. Its stylesheets are copies of the brandbook's
// brand/ui/apps/* (its brand:sync writes them; its brand:check fails on a stale one) and say so on their first line.
// A new stylesheet is written in the brandbook and listed in its consumers.json. Run: pnpm test:brand
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const written = (hub) => `/* Written in chanwe-brandbook (brand/${hub}) and copied here by its brand:sync (D-0060). Never edit this copy. */`;
const COPIES = {
  "src/app/chanwe-theme.css": written("ui/apps/umami.css"),
  "src/app/chanwe-web-navigation.css": written("ui/apps/umami-web-navigation.css"),
  "src/brand/tokens.css": "/* Generated from brand/ui/tokens/tokens.json by scripts/brand-tokens.mjs. Do not edit; change tokens.json and run npm run brand:tokens. */"
};
// Upstream Umami's own, kept as it ships them; after an upstream merge, update this list with its files only.
const OTHERS = [
  "src/app/(main)/websites/[websiteId]/(reports)/heatmaps/Heatmap.module.css",
  "src/app/(main)/websites/[websiteId]/(reports)/journeys/Journey.module.css",
  "src/app/(main)/websites/[websiteId]/(reports)/performance/Performance.module.css",
  "src/app/(main)/websites/[websiteId]/replays/ReplayModal.module.css",
  "src/app/(main)/websites/[websiteId]/sessions/SessionModal.module.css",
  "src/app/global.css",
  "src/components/charts/ChartAnnotationMarkers.module.css",
  "src/components/common/Badge.module.css",
  "src/components/common/OverlayScrollArea.module.css",
  "src/components/metrics/PerformanceCard.module.css",
  "src/components/modals/TwoFactorSetupModal.module.css",
  "src/components/modals/TwoFactorSuccessModal.module.css"
];

// Every stylesheet in the repo, committed or not (what .gitignore leaves out, such as node_modules, does not count).
const stylesheets = () => execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 })
  .split("\0").filter((f) => /\.(css|scss|sass|less)$/i.test(f)).sort();

test("each stylesheet is the brandbook's copy", () => {
  for (const [path, header] of Object.entries(COPIES)) {
    assert.equal(readFileSync(join(root, path), "utf8").split("\n", 1)[0], header, path);
  }
});

test("no stylesheet was added beside them", () => {
  assert.deepEqual(stylesheets(), [...Object.keys(COPIES), ...OTHERS].sort(), "write a new stylesheet in chanwe-brandbook (brand/ui/apps) and list it in its consumers.json");
});
