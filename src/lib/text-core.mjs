export function cleanText(value, { max = 240, min = 0 } = {}) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (normalized.length < min) return "";
  return normalized.slice(0, max);
}

export function slugify(value, max = 80) {
  return cleanText(value, { max }).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "burger";
}

export function stableHash(value) {
  const input = typeof value === "string" ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function uniqueStrings(values, { maxItems = 8, maxLength = 50 } = {}) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const clean = cleanText(value, { max: maxLength, min: 1 });
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length >= maxItems) break;
  }
  return result;
}
