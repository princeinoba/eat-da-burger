import { BUILDER_OPTIONS, DEMO_DISCLOSURE } from "../content/burgers.mjs";
import { cleanText, stableHash, uniqueStrings } from "./text-core.mjs";

const BASES = new Set(BUILDER_OPTIONS.bases);
const STYLES = new Set(BUILDER_OPTIONS.styles);
const SPICE = new Set(BUILDER_OPTIONS.spiceLevels);
const DIETARY = new Set(BUILDER_OPTIONS.dietaryPreferences);

const BASE_LABELS = {
  beef: "beef patty", chicken: "chicken patty", turkey: "turkey patty", fish: "fish fillet",
  plant: "plant-based patty", cheese: "grilled cheese-style centre"
};
const STYLE_PARTS = {
  classic: ["pickle crunch", "shredded lettuce", "house-style sauce"],
  smash: ["griddled onions", "crisp pickles", "pepper sauce"],
  gourmet: ["caramelized onion", "herb aioli-style sauce", "artisan-style bun"],
  breakfast: ["potato hash", "tomato jam", "egg-style topping"],
  spicy: ["roasted peppers", "chili crunch", "cool slaw"],
  international: ["spiced relish", "fresh herb slaw", "tangy sauce"]
};
const NAME_LEFT = ["Ember", "Maple", "Midnight", "Golden", "Garden", "Harbour", "Fireline", "Market", "Sunrise", "Cedar", "Neon", "Smoky"];
const NAME_RIGHT = ["Crunch", "Stack", "Melt", "Forge", "Tower", "Press", "Bite", "Drift", "Sizzle", "Rush", "Club", "Burst"];
const EXTRA = ["crispy onions", "avocado", "tomato relish", "cabbage slaw", "cucumber ribbons", "roasted corn", "lemon herbs", "charred pineapple", "smoked cheddar-style topping", "sesame crunch"];

export function normalizePreferences(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("Preferences must be an object.");
  const protein = BASES.has(input.protein) ? input.protein : "surprise";
  const style = STYLES.has(input.style) ? input.style : "surprise";
  const spiceLevel = SPICE.has(input.spiceLevel) ? input.spiceLevel : "medium";
  const dietaryPreference = DIETARY.has(input.dietaryPreference) ? input.dietaryPreference : "none";
  const includeIngredients = uniqueStrings(input.includeIngredients, { maxItems: 5, maxLength: 40 });
  const excludeIngredients = uniqueStrings(input.excludeIngredients, { maxItems: 8, maxLength: 40 });
  const notes = cleanText(input.notes, { max: 240 });
  return { protein, style, spiceLevel, dietaryPreference, includeIngredients, excludeIngredients, notes };
}

function pick(list, seed, offset = 0) { return list[(seed + offset * 17) % list.length]; }
function resolvedBase(preferences, seed, offset) {
  if (preferences.dietaryPreference === "vegan") return "plant";
  if (preferences.dietaryPreference === "vegetarian" && !["plant", "cheese"].includes(preferences.protein)) return offset % 2 ? "cheese" : "plant";
  if (preferences.protein !== "surprise") return preferences.protein;
  return pick(["beef", "chicken", "turkey", "fish", "plant", "cheese"], seed, offset);
}
function resolvedStyle(preferences, seed, offset) {
  return preferences.style === "surprise" ? pick(["classic", "smash", "gourmet", "breakfast", "spicy", "international"], seed, offset + 3) : preferences.style;
}
function notExcluded(candidate, exclusions) {
  const lower = candidate.toLowerCase();
  return !exclusions.some(item => lower.includes(item.toLowerCase()) || item.toLowerCase().includes(lower));
}

export function makeFallbackSuggestions(rawPreferences = {}) {
  const preferences = normalizePreferences(rawPreferences);
  const seed = stableHash(preferences);
  const suggestions = Array.from({ length: 3 }, (_, index) => {
    const base = resolvedBase(preferences, seed, index);
    const style = resolvedStyle(preferences, seed, index);
    const name = `${pick(NAME_LEFT, seed, index)} ${pick(NAME_RIGHT, seed, index + 5)}`;
    const ingredients = [BASE_LABELS[base], ...preferences.includeIngredients, ...(STYLE_PARTS[style] || STYLE_PARTS.classic), pick(EXTRA, seed, index + 9)]
      .filter(item => notExcluded(item, preferences.excludeIngredients));
    const finalIngredients = uniqueStrings(ingredients, { maxItems: 8, maxLength: 55 });
    const dietaryTags = [];
    if (preferences.dietaryPreference !== "none") dietaryTags.push(`${preferences.dietaryPreference} preference`);
    if (base === "plant") dietaryTags.push("plant-based concept");
    if (base === "cheese") dietaryTags.push("vegetarian concept");
    return {
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${index + 1}`,
      name: name.slice(0, 75),
      description: `${preferences.spiceLevel[0].toUpperCase() + preferences.spiceLevel.slice(1)}-heat ${style} burger concept built around ${BASE_LABELS[base]} and ${finalIngredients.slice(1, 3).join(" with ")}.`.slice(0, 180),
      ingredients: finalIngredients.length >= 3 ? finalIngredients : [BASE_LABELS[base], "shredded lettuce", "tomato relish"],
      dietaryTags: uniqueStrings(dietaryTags, { maxItems: 5, maxLength: 30 }),
      prepNotes: `Taste and adjust the ${preferences.spiceLevel} heat before serving. Verify every ingredient and preparation surface for the people eating it.`.slice(0, 240),
      fitReasons: uniqueStrings([
        `${style} style requested`,
        `${preferences.spiceLevel} spice preference`,
        preferences.includeIngredients.length ? `Includes ${preferences.includeIngredients.slice(0, 2).join(" and ")}` : `${base} base selected`
      ], { maxItems: 3, maxLength: 80 }),
      spiceLevel: preferences.spiceLevel,
      style
    };
  });
  return { suggestions, preferences, warning: DEMO_DISCLOSURE };
}

export function validateSuggestionPayload(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.suggestions) || value.suggestions.length !== 3) return null;
  const suggestions = [];
  for (let index = 0; index < value.suggestions.length; index += 1) {
    const raw = value.suggestions[index];
    if (!raw || typeof raw !== "object") return null;
    const name = cleanText(raw.name, { max: 75, min: 1 });
    const description = cleanText(raw.description, { max: 180, min: 10 });
    const ingredients = uniqueStrings(raw.ingredients, { maxItems: 10, maxLength: 60 });
    const dietaryTags = uniqueStrings(raw.dietaryTags, { maxItems: 5, maxLength: 30 });
    const prepNotes = cleanText(raw.prepNotes, { max: 240 });
    const fitReasons = uniqueStrings(raw.fitReasons, { maxItems: 3, maxLength: 80 });
    if (!name || !description || ingredients.length < 3) return null;
    suggestions.push({
      id: cleanText(raw.id, { max: 90 }) || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
      name, description, ingredients, dietaryTags, prepNotes,
      fitReasons: fitReasons.length ? fitReasons : ["Generated from the selected builder preferences"],
      spiceLevel: SPICE.has(raw.spiceLevel) ? raw.spiceLevel : "medium",
      style: STYLES.has(raw.style) ? raw.style : "gourmet"
    });
  }
  return { suggestions };
}

export const BURGER_JSON_SCHEMA = Object.freeze({
  name: "burger_suggestions",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["suggestions"],
    properties: {
      suggestions: {
        type: "array", minItems: 3, maxItems: 3,
        items: {
          type: "object", additionalProperties: false,
          required: ["name", "description", "ingredients", "dietaryTags", "prepNotes", "fitReasons", "spiceLevel", "style"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 75 },
            description: { type: "string", minLength: 10, maxLength: 180 },
            ingredients: { type: "array", minItems: 3, maxItems: 10, items: { type: "string", minLength: 1, maxLength: 60 } },
            dietaryTags: { type: "array", maxItems: 5, items: { type: "string", minLength: 1, maxLength: 30 } },
            prepNotes: { type: "string", maxLength: 240 },
            fitReasons: { type: "array", minItems: 1, maxItems: 3, items: { type: "string", minLength: 1, maxLength: 80 } },
            spiceLevel: { type: "string", enum: ["mild", "medium", "hot"] },
            style: { type: "string", enum: ["classic", "smash", "gourmet", "breakfast", "spicy", "international", "surprise"] }
          }
        }
      }
    }
  }
});
