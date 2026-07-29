import test from "node:test";
import assert from "node:assert/strict";
import { BOARD_LIMIT, addItem, boardCounts, createBoardItem, normalizeBoard, removeItem, updateItem } from "../src/lib/board-core.mjs";

test("malformed board becomes a safe empty schema", () => {
  assert.deepEqual(normalizeBoard(null), { version: 2, items: [] });
  assert.deepEqual(normalizeBoard({ version: 1, items: [{ id: "old" }] }), { version: 2, items: [] });
});

test("normalization deduplicates and bounds records", () => {
  const items = Array.from({ length: BOARD_LIMIT + 10 }, (_, index) => ({ id: `id-${Math.min(index, BOARD_LIMIT - 1)}`, name: `Burger ${index}`, status: index % 2 ? "devoured" : "queued", createdAt: new Date(0).toISOString() }));
  const board = normalizeBoard({ version: 2, items });
  assert.equal(board.items.length, BOARD_LIMIT);
  assert.equal(new Set(board.items.map(item => item.id)).size, BOARD_LIMIT);
});

test("create add update and remove preserve the domain contract", () => {
  const now = new Date("2026-07-29T12:00:00.000Z");
  const item = createBoardItem({ id: "test", name: " Test Stack ", ingredients: ["patty", "slaw"] }, { source: "curated", now });
  let board = addItem(null, item);
  assert.equal(board.items[0].name, "Test Stack");
  board = updateItem(board, "test", { status: "devoured", rating: 5, note: "Excellent crunch" }, now);
  assert.deepEqual(boardCounts(board), { total: 1, queued: 0, devoured: 1, rated: 1 });
  assert.equal(board.items[0].note, "Excellent crunch");
  board = removeItem(board, "test");
  assert.equal(board.items.length, 0);
});

test("invalid manual names are rejected", () => {
  assert.throws(() => createBoardItem({ name: "" }), /Burger name/);
});
