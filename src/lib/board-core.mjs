import { cleanText, uniqueStrings } from "./text-core.mjs";

export const BOARD_VERSION = 2;
export const BOARD_LIMIT = 50;
export const STATUS = Object.freeze(["queued", "devoured"]);

export function normalizeBoard(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawItems = source.version === BOARD_VERSION && Array.isArray(source.items) ? source.items : [];
  const seen = new Set();
  const items = [];
  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const id = cleanText(raw.id, { max: 100, min: 1 });
    const name = cleanText(raw.name, { max: 75, min: 1 });
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    const status = STATUS.includes(raw.status) ? raw.status : "queued";
    const ratingNumber = Number(raw.rating);
    const rating = Number.isInteger(ratingNumber) && ratingNumber >= 1 && ratingNumber <= 5 ? ratingNumber : null;
    const createdAt = Number.isFinite(Date.parse(raw.createdAt)) ? new Date(raw.createdAt).toISOString() : new Date(0).toISOString();
    const updatedAt = Number.isFinite(Date.parse(raw.updatedAt)) ? new Date(raw.updatedAt).toISOString() : createdAt;
    items.push({
      id, name,
      description: cleanText(raw.description, { max: 180 }),
      ingredients: uniqueStrings(raw.ingredients, { maxItems: 10, maxLength: 60 }),
      dietaryTags: uniqueStrings(raw.dietaryTags, { maxItems: 5, maxLength: 30 }),
      prepNotes: cleanText(raw.prepNotes, { max: 240 }),
      fitReasons: uniqueStrings(raw.fitReasons, { maxItems: 3, maxLength: 80 }),
      source: ["manual", "curated", "ai", "fallback"].includes(raw.source) ? raw.source : "manual",
      status, rating,
      note: cleanText(raw.note, { max: 800 }),
      createdAt, updatedAt
    });
    if (items.length >= BOARD_LIMIT) break;
  }
  return { version: BOARD_VERSION, items };
}

export function createBoardItem(input, { source = "manual", now = new Date() } = {}) {
  const name = cleanText(input?.name, { max: 75, min: 1 });
  if (!name) throw new TypeError("Burger name must contain 1 to 75 characters.");
  const stamp = now.toISOString();
  const suffix = Math.random().toString(36).slice(2, 9);
  return normalizeBoard({ version: BOARD_VERSION, items: [{
    ...input,
    id: cleanText(input?.id, { max: 100 }) || `burger-${Date.now()}-${suffix}`,
    name, source, status: "queued", rating: null, note: "", createdAt: stamp, updatedAt: stamp
  }] }).items[0];
}

export function addItem(board, item) {
  const normalized = normalizeBoard(board);
  const safe = createBoardItem(item, { source: item.source || "manual", now: new Date(item.createdAt || Date.now()) });
  const remaining = normalized.items.filter(existing => existing.id !== safe.id);
  return normalizeBoard({ version: BOARD_VERSION, items: [safe, ...remaining].slice(0, BOARD_LIMIT) });
}

export function updateItem(board, id, patch = {}, now = new Date()) {
  const normalized = normalizeBoard(board);
  return normalizeBoard({ version: BOARD_VERSION, items: normalized.items.map(item => item.id !== id ? item : {
    ...item,
    status: STATUS.includes(patch.status) ? patch.status : item.status,
    rating: patch.rating === null ? null : Number(patch.rating),
    note: patch.note === undefined ? item.note : patch.note,
    updatedAt: now.toISOString()
  }) });
}

export function removeItem(board, id) {
  const normalized = normalizeBoard(board);
  return { version: BOARD_VERSION, items: normalized.items.filter(item => item.id !== id) };
}

export function boardCounts(board) {
  const items = normalizeBoard(board).items;
  return { total: items.length, queued: items.filter(item => item.status === "queued").length, devoured: items.filter(item => item.status === "devoured").length, rated: items.filter(item => item.rating).length };
}
