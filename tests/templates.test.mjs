import test from "node:test";
import assert from "node:assert/strict";
import { renderDocument } from "../src/templates/layout.mjs";
import { aboutPage, boardPage, builderPage, homePage, ideasPage, journalPage, notFoundPage, offlinePage, privacyPage, safetyPage } from "../src/templates/pages.mjs";
const pages = [homePage(), builderPage(), ideasPage(), boardPage(), journalPage(), aboutPage(), safetyPage(), privacyPage(), offlinePage(), notFoundPage()];
test("every page body has exactly one main and one h1", () => {
  for (const page of pages) {
    assert.equal((page.match(/<main\b/g) || []).length, 1);
    assert.equal((page.match(/<h1\b/g) || []).length, 1);
  }
});
test("document contains metadata, navigation and no inline handlers", () => {
  const document = renderDocument({ title: "Test", description: "A test page description.", path: "/test/", main: homePage(), robots: "noindex,follow" });
  assert.match(document, /<meta name="description"/);
  assert.match(document, /<meta name="robots" content="noindex,follow"/);
  assert.match(document, /Skip to content/);
  assert.doesNotMatch(document, /onclick=/i);
  assert.doesNotMatch(document, /<script(?![^>]*src=)/i);
});
