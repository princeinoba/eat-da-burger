import { CURATED_BURGERS } from "/assets/modules/content/burgers.mjs";
import { addItem, boardCounts, createBoardItem, normalizeBoard, removeItem, updateItem } from "/assets/modules/lib/board-core.mjs";
import { makeFallbackSuggestions } from "/assets/modules/lib/suggestion-core.mjs";

const BOARD_KEY = "burgerforge:board:v2";
const MAX_IMPORT_BYTES = 512_000;
const toast = message => window.BurgerForgeToast?.(message);
function safeParse(value) { try { return JSON.parse(value); } catch { return null; } }
function readBoard() { try { return normalizeBoard(safeParse(localStorage.getItem(BOARD_KEY))); } catch { return normalizeBoard(null); } }
function writeBoard(board) { const value = normalizeBoard(board); try { localStorage.setItem(BOARD_KEY, JSON.stringify(value)); } catch { toast("This browser could not save the board."); } document.dispatchEvent(new CustomEvent("burgerforge:board-change", { detail: value })); return value; }
function addBurger(input, source = "manual") { const board = readBoard(); const item = createBoardItem(input, { source }); writeBoard(addItem(board, item)); toast(`${item.name} added to your board.`); return item; }
function esc(value = "") { return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }
function icon(name) { const path = name === "check" ? '<path d="m5 12 4 4L19 6"/>' : name === "trash" ? '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/>' : name === "undo" ? '<path d="M9 7 4 12l5 5"/><path d="M5 12h9a5 5 0 0 1 5 5"/>' : name === "plus" ? '<path d="M12 5v14M5 12h14"/>' : '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>'; return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`; }

function curatedById(id) { return CURATED_BURGERS.find(item => item.id === id); }
document.addEventListener("click", event => {
  const button = event.target.closest("[data-add-curated]");
  if (!button) return;
  const idea = curatedById(button.dataset.addCurated);
  if (idea) addBurger({ ...idea, fitReasons: [`Curated ${idea.style} direction`] }, "curated");
});

const ideaSearch = document.querySelector("[data-idea-search]");
const ideaGrid = document.querySelector("[data-idea-grid]");
const ideaCount = document.querySelector("[data-idea-count]");
const ideaEmpty = document.querySelector("[data-idea-empty]");
function filterIdeas() { if (!ideaGrid) return; const query = (ideaSearch?.value || "").trim().toLowerCase(); let visible = 0; ideaGrid.querySelectorAll("[data-idea-id]").forEach((card, index) => { const item = CURATED_BURGERS[index]; const match = !query || `${item.name} ${item.base} ${item.style} ${item.ingredients.join(" ")}`.toLowerCase().includes(query); card.hidden = !match; if (match) visible += 1; }); if (ideaCount) ideaCount.textContent = `${visible} idea${visible === 1 ? "" : "s"}`; if (ideaEmpty) ideaEmpty.hidden = visible !== 0; }
ideaSearch?.addEventListener("input", filterIdeas);

const builderForm = document.querySelector("[data-builder-form]");
const builderStatus = document.querySelector("[data-builder-status]");
const builderMode = document.querySelector("[data-builder-mode]");
const suggestionResults = document.querySelector("[data-suggestion-results]");
const tryAgain = document.querySelector("[data-try-again]");
const notes = builderForm?.elements.namedItem("notes");
notes?.addEventListener("input", () => { const counter = document.querySelector("[data-notes-count]"); if (counter) counter.textContent = String(notes.value.length); });
function preferencesFrom(form) { const data = new FormData(form); const list = name => String(data.get(name) || "").split(",").map(value => value.trim()).filter(Boolean); return { protein: data.get("protein"), style: data.get("style"), spiceLevel: data.get("spiceLevel"), dietaryPreference: data.get("dietaryPreference"), includeIngredients: list("includeIngredients"), excludeIngredients: list("excludeIngredients"), notes: String(data.get("notes") || "") }; }
function renderSkeletons() { if (!suggestionResults) return; suggestionResults.innerHTML = Array.from({ length: 3 }, () => `<article class="suggestion-card suggestion-card--loading"><div class="skeleton skeleton--title"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton skeleton--button"></div></article>`).join(""); }
function renderSuggestions(suggestions, mode) { if (!suggestionResults) return; suggestionResults.innerHTML = suggestions.map((item, index) => `<article class="suggestion-card"><div class="suggestion-number">0${index + 1}</div><p class="eyebrow">${esc(item.style)} · ${esc(item.spiceLevel)} heat</p><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><h4>Stack</h4><ul class="ingredient-list">${item.ingredients.map(value => `<li>${esc(value)}</li>`).join("")}</ul>${item.dietaryTags.length ? `<ul class="chip-list">${item.dietaryTags.map(value=>`<li>${esc(value)}</li>`).join("")}</ul>` : ""}<h4>Why it fits</h4><ul class="fit-list">${item.fitReasons.map(value=>`<li>${esc(value)}</li>`).join("")}</ul>${item.prepNotes ? `<p class="prep-note"><strong>Prep note:</strong> ${esc(item.prepNotes)}</p>` : ""}<button class="button button--full" type="button" data-add-suggestion="${index}">${icon("plus")} Add to Devour Board</button></article>`).join(""); suggestionResults.querySelectorAll("[data-add-suggestion]").forEach(button => button.addEventListener("click", () => { const item = suggestions[Number(button.dataset.addSuggestion)]; addBurger(item, mode === "live-ai" ? "ai" : "fallback"); })); }
async function buildSuggestions() {
  if (!builderForm) return;
  const preferences = preferencesFrom(builderForm);
  const submit = builderForm.querySelector('button[type="submit"]');
  submit.disabled = true; tryAgain.hidden = true; builderMode.textContent = "Building"; builderStatus.textContent = "Validating your brief and assembling three concepts…"; renderSkeletons();
  let payload;
  try {
    const response = await fetch("/api/ai/burger-suggestions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(preferences) });
    if (!response.ok) throw new Error("request failed");
    payload = await response.json();
  } catch {
    const fallback = makeFallbackSuggestions(preferences);
    payload = { suggestions: fallback.suggestions, mode: "local-fallback", providerStatus: "browser_fallback" };
  }
  renderSuggestions(payload.suggestions, payload.mode); builderMode.textContent = payload.mode === "live-ai" ? "Live AI" : "Local fallback"; builderStatus.textContent = payload.mode === "live-ai" ? "Three live-assisted concepts are ready. Review before saving." : "Three deterministic fallback concepts are ready. Review before saving."; tryAgain.hidden = false; submit.disabled = false;
}
builderForm?.addEventListener("submit", event => { event.preventDefault(); buildSuggestions(); });
tryAgain?.addEventListener("click", buildSuggestions);

const manualForm = document.querySelector("[data-manual-form]");
manualForm?.addEventListener("submit", event => { event.preventDefault(); const name = String(new FormData(manualForm).get("name") || "").trim(); const status = document.querySelector("[data-manual-status]"); if (!name) { if (status) status.textContent = "Enter a burger name."; return; } try { addBurger({ name }, "manual"); manualForm.reset(); if (status) status.textContent = `${name} added.`; renderBoard(); } catch (error) { if (status) status.textContent = error.message; } });

let activeFilter = "all";
function boardCard(item) { return `<article class="board-card" data-board-id="${esc(item.id)}"><div class="board-card__head"><div><span class="source-badge">${esc(item.source)}</span><h3>${esc(item.name)}</h3></div><button class="icon-button icon-button--danger" type="button" data-board-action="delete" aria-label="Delete ${esc(item.name)}">${icon("trash")}</button></div>${item.description?`<p>${esc(item.description)}</p>`:""}${item.ingredients.length?`<ul class="chip-list">${item.ingredients.slice(0,5).map(value=>`<li>${esc(value)}</li>`).join("")}</ul>`:""}<div class="board-card__footer"><span class="status-badge status-${item.status}">${item.status === "queued" ? "To be devoured" : "Devoured"}</span><button class="button button--small ${item.status === "devoured" ? "button--secondary" : ""}" type="button" data-board-action="${item.status === "queued" ? "devour" : "undo"}">${icon(item.status === "queued" ? "check" : "undo")} ${item.status === "queued" ? "Mark devoured" : "Move to queue"}</button></div></article>`; }
function renderBoard() { const grid = document.querySelector("[data-board-grid]"); if (!grid) return; const board = readBoard(); const counts = boardCounts(board); const set = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = String(value); }; set("[data-board-total]", counts.total); set("[data-count-all]", counts.total); set("[data-count-queued]", counts.queued); set("[data-count-devoured]", counts.devoured); const items = activeFilter === "all" ? board.items : board.items.filter(item => item.status === activeFilter); grid.innerHTML = items.length ? items.map(boardCard).join("") : `<div class="empty-state">${icon("star")}<h2>No ${activeFilter === "all" ? "burgers" : activeFilter + " burgers"} here</h2><p>Build an idea, add a curated concept, or use the quick-add form.</p><a class="button" href="/builder/">Build a burger</a></div>`; grid.querySelectorAll("[data-board-action]").forEach(button => button.addEventListener("click", () => { const card = button.closest("[data-board-id]"); const id = card.dataset.boardId; const action = button.dataset.boardAction; let next = readBoard(); if (action === "delete") next = removeItem(next, id); else next = updateItem(next, id, { status: action === "devour" ? "devoured" : "queued" }); writeBoard(next); renderBoard(); })); }
document.querySelectorAll("[data-board-filter]").forEach(button => button.addEventListener("click", () => { activeFilter = button.dataset.boardFilter; document.querySelectorAll("[data-board-filter]").forEach(other => other.setAttribute("aria-pressed", String(other === button))); renderBoard(); }));
document.querySelector("[data-clear-board]")?.addEventListener("click", () => { if (!readBoard().items.length) return; if (confirm("Clear every burger and tasting note from this browser?")) { writeBoard({ version: 2, items: [] }); renderBoard(); toast("The board was cleared."); } });
document.querySelector("[data-export-board]")?.addEventListener("click", () => { const payload = { product: "BurgerForge AI", exportedAt: new Date().toISOString(), disclosure: "This file contains private browser-local burger ideas and tasting notes.", board: readBoard() }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `burgerforge-board-${new Date().toISOString().slice(0,10)}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0); });
document.querySelector("[data-import-board]")?.addEventListener("change", async event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (file.size > MAX_IMPORT_BYTES) return toast("That import file is too large."); try { const parsed = JSON.parse(await file.text()); const incoming = normalizeBoard(parsed.board || parsed); if (readBoard().items.length && !confirm("Replace the current board with the imported records?")) return; writeBoard(incoming); renderBoard(); toast(`${incoming.items.length} burger records imported.`); } catch { toast("The selected file is not a valid BurgerForge export."); } });

function stars(item) { return Array.from({ length: 5 }, (_, index) => { const value = index + 1; return `<button type="button" data-rating="${value}" aria-label="Rate ${esc(item.name)} ${value} out of 5" aria-pressed="${item.rating === value}">${icon("star")}</button>`; }).join(""); }
function renderJournal() { const grid = document.querySelector("[data-journal-grid]"); if (!grid) return; const items = readBoard().items.filter(item => item.status === "devoured"); const count = document.querySelector("[data-journal-count]"); if (count) count.textContent = String(items.length); grid.innerHTML = items.length ? items.map(item => `<article class="journal-card" data-journal-id="${esc(item.id)}"><div><p class="eyebrow">${new Date(item.updatedAt).toLocaleDateString()}</p><h2>${esc(item.name)}</h2>${item.description?`<p>${esc(item.description)}</p>`:""}</div><fieldset><legend>Your rating</legend><div class="rating-row">${stars(item)}</div></fieldset><label><span>Private tasting note</span><textarea rows="4" maxlength="800" data-journal-note placeholder="What worked? What would you change?">${esc(item.note)}</textarea><small>${item.note.length}/800 characters</small></label><p class="save-state" aria-live="polite"></p></article>`).join("") : `<div class="empty-state">${icon("star")}<h2>No tasting notes yet</h2><p>Mark a burger devoured on the board to begin.</p><a class="button" href="/board/">Open Devour Board</a></div>`; grid.querySelectorAll("[data-journal-id]").forEach(card => { const id = card.dataset.journalId; card.querySelectorAll("[data-rating]").forEach(button => button.addEventListener("click", () => { writeBoard(updateItem(readBoard(), id, { rating: Number(button.dataset.rating) })); renderJournal(); })); const note = card.querySelector("[data-journal-note]"); note.addEventListener("change", () => { writeBoard(updateItem(readBoard(), id, { note: note.value })); const updatedCard = [...grid.querySelectorAll("[data-journal-id]")].find(element => element.dataset.journalId === id); const status = updatedCard?.querySelector(".save-state"); if (status) status.textContent = "Note saved locally."; }); note.addEventListener("input", () => { card.querySelector("label small").textContent = `${note.value.length}/800 characters`; }); }); }

renderBoard();
renderJournal();
document.addEventListener("burgerforge:board-change", () => { renderBoard(); renderJournal(); });
