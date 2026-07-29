import test from "node:test";
import assert from "node:assert/strict";
import { BUILDER_OPTIONS, CURATED_BURGERS, DEMO_DISCLOSURE } from "../src/content/burgers.mjs";

test("curated catalogue contains eight complete unique ideas", () => {
  assert.equal(CURATED_BURGERS.length, 8);
  assert.equal(new Set(CURATED_BURGERS.map(item => item.id)).size, 8);
  assert.equal(new Set(CURATED_BURGERS.map(item => item.name)).size, 8);
  for (const item of CURATED_BURGERS) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    assert.ok(item.name.length > 3 && item.name.length <= 75);
    assert.ok(item.description.length >= 30 && item.description.length <= 180);
    assert.ok(item.ingredients.length >= 4 && item.ingredients.length <= 10);
    assert.ok(BUILDER_OPTIONS.styles.includes(item.style));
    assert.ok(BUILDER_OPTIONS.bases.includes(item.base));
    assert.ok(BUILDER_OPTIONS.spiceLevels.includes(item.spiceLevel));
    assert.ok(item.prepNotes.length <= 240);
  }
});

test("disclosure does not claim verified nutrition or allergen safety", () => {
  assert.match(DEMO_DISCLOSURE, /not verified/i);
  assert.match(DEMO_DISCLOSURE, /allergen/i);
  assert.match(DEMO_DISCLOSURE, /nutrition/i);
});
