import test from "node:test";
import assert from "node:assert/strict";
import { makeFallbackSuggestions, normalizePreferences, validateSuggestionPayload } from "../src/lib/suggestion-core.mjs";

test("preferences are allowlisted and bounded", () => {
  const value = normalizePreferences({ protein: "dragon", style: "smash", spiceLevel: "hot", dietaryPreference: "vegan", includeIngredients: [" avocado ", "avocado", "x".repeat(100)], excludeIngredients: ["mushroom"], notes: "n".repeat(300) });
  assert.equal(value.protein, "surprise");
  assert.equal(value.style, "smash");
  assert.equal(value.dietaryPreference, "vegan");
  assert.deepEqual(value.includeIngredients.slice(0, 2), ["avocado", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"]);
  assert.equal(value.notes.length, 240);
});

test("fallback produces exactly three deterministic structured ideas", () => {
  const preferences = { protein: "chicken", style: "international", spiceLevel: "medium", dietaryPreference: "none", includeIngredients: ["avocado"], excludeIngredients: ["mushroom"] };
  const first = makeFallbackSuggestions(preferences);
  const second = makeFallbackSuggestions(preferences);
  assert.deepEqual(first, second);
  assert.equal(first.suggestions.length, 3);
  for (const item of first.suggestions) {
    assert.ok(item.name.length <= 75);
    assert.ok(item.ingredients.length >= 3);
    assert.ok(item.ingredients.some(value => /avocado/i.test(value)));
    assert.ok(item.ingredients.every(value => !/mushroom/i.test(value)));
    assert.ok(item.fitReasons.length >= 1 && item.fitReasons.length <= 3);
  }
});

test("vegan preference resolves to plant-based concepts", () => {
  const result = makeFallbackSuggestions({ dietaryPreference: "vegan", protein: "beef" });
  assert.ok(result.suggestions.every(item => item.ingredients[0] === "plant-based patty"));
  assert.ok(result.suggestions.every(item => item.dietaryTags.some(tag => /vegan preference/i.test(tag))));
});

test("provider payload validation rejects malformed output", () => {
  assert.equal(validateSuggestionPayload({ suggestions: [] }), null);
  assert.equal(validateSuggestionPayload({ suggestions: [{ name: "x" }, { name: "y" }, { name: "z" }] }), null);
});

test("provider payload validation normalizes safe output", () => {
  const raw = { suggestions: Array.from({ length: 3 }, (_, index) => ({ name: `Idea ${index}`, description: "A complete and practical burger description.", ingredients: ["patty", "slaw", "sauce"], dietaryTags: [], prepNotes: "Check ingredients.", fitReasons: ["Matches preferences"], spiceLevel: "mild", style: "classic" })) };
  const value = validateSuggestionPayload(raw);
  assert.equal(value.suggestions.length, 3);
  assert.match(value.suggestions[0].id, /^idea-0/);
});
