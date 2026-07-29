const THEME_KEY = "burgerforge:theme:v1";
const themeOrder = ["system", "light", "dark"];
function readTheme() { try { const value = localStorage.getItem(THEME_KEY); return themeOrder.includes(value) ? value : "system"; } catch { return "system"; } }
function applyTheme(value) { document.documentElement.dataset.theme = value; const button = document.querySelector("[data-theme-toggle]"); if (button) button.title = `Theme: ${value}`; }
function nextTheme() { const current = document.documentElement.dataset.theme || "system"; const next = themeOrder[(themeOrder.indexOf(current) + 1) % themeOrder.length]; try { localStorage.setItem(THEME_KEY, next); } catch {} applyTheme(next); toast(`Theme changed to ${next}.`); }
applyTheme(readTheme());

const menuButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-primary-nav]");
function closeMenu({ restore = false } = {}) { if (!menuButton || !nav) return; nav.dataset.open = "false"; menuButton.setAttribute("aria-expanded", "false"); menuButton.setAttribute("aria-label", "Open navigation"); if (restore) menuButton.focus(); }
menuButton?.addEventListener("click", () => { const open = nav.dataset.open === "true"; nav.dataset.open = String(!open); menuButton.setAttribute("aria-expanded", String(!open)); menuButton.setAttribute("aria-label", open ? "Open navigation" : "Close navigation"); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu({ restore: nav?.dataset.open === "true" }); });
nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
document.querySelector("[data-theme-toggle]")?.addEventListener("click", nextTheme);

const COMMANDS = [
  { label: "Home", detail: "Product overview", href: "/" },
  { label: "AI Burger Builder", detail: "Generate three structured ideas", href: "/builder/" },
  { label: "Idea Lab", detail: "Curated burger blueprints", href: "/ideas/" },
  { label: "Devour Board", detail: "Queued and devoured concepts", href: "/board/" },
  { label: "Tasting Journal", detail: "Ratings and private notes", href: "/journal/" },
  { label: "Food & AI safety", detail: "Important boundaries", href: "/safety/" },
  { label: "Privacy", detail: "Local data and provider requests", href: "/privacy/" },
  { label: "Architecture", detail: "How the two projects were consolidated", href: "/about/" }
];
const dialog = document.querySelector("[data-command-dialog]");
const commandInput = document.querySelector("[data-command-input]");
const commandResults = document.querySelector("[data-command-results]");
function renderCommands(query = "") { if (!commandResults) return; const needle = query.trim().toLowerCase(); const matches = COMMANDS.filter(item => `${item.label} ${item.detail}`.toLowerCase().includes(needle)); commandResults.innerHTML = matches.length ? matches.map(item => `<a href="${item.href}"><strong>${item.label}</strong><span>${item.detail}</span></a>`).join("") : `<p class="command-empty">No page matched “${query.replace(/[<>]/g, "")}”.</p>`; }
function openCommands() { if (!dialog?.showModal) return; renderCommands(); dialog.showModal(); requestAnimationFrame(() => commandInput?.focus()); }
document.addEventListener("keydown", event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); dialog?.open ? dialog.close() : openCommands(); } });
commandInput?.addEventListener("input", () => renderCommands(commandInput.value));
renderCommands();

const toastRegion = document.querySelector("[data-toast-region]");
export function toast(message) { if (!toastRegion) return; const element = document.createElement("div"); element.className = "toast"; element.textContent = message; toastRegion.append(element); setTimeout(() => element.remove(), 4200); }
window.BurgerForgeToast = toast;

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
