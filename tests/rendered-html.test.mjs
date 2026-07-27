import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the Fieldline operations prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Fieldline by FDI/);
  assert.match(html, /Live workflow/);
  assert.match(html, /Customer requests route automatically/);
  assert.match(html, /Auto-routing on/);
  assert.match(html, /FDI exceptions/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("preserves the recovered brief and pilot boundaries", async () => {
  const [brief, page, packageJson] = await Promise.all([
    readFile(new URL("../PRODUCT_BRIEF.md", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(brief, /not an open marketplace/i);
  assert.match(brief, /QuickBooks Online remains the accounting system/i);
  assert.match(brief, /no automatic \$5,000/i);
  assert.match(page, /customerPrice.*vendorCost \/ \(1 - margin \/ 100\)/);
  assert.match(page, /Vendors cannot see who else was invited/);
  assert.match(page, /Do not proceed beyond approved scope or NTE/);
  assert.match(page, /onClick=\{\(\)=>setSelected\(job\)\}>View details/);
  assert.match(page, /function VendorMyJobs/);
  assert.match(page, /onClick=\{\(\)=>setSelected\(r\)\}/);
  assert.match(page, /action:"counter_offer"/);
  assert.match(page, /function LiveWorkflowPage/);
  assert.match(page, /Authorize & submit/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
