import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderDocument } from "../src/templates/layout.mjs";
import { aboutPage, boardPage, builderPage, homePage, ideasPage, journalPage, notFoundPage, offlinePage, privacyPage, safetyPage } from "../src/templates/pages.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = join(root, "dist");
const indexable = process.env.BURGERFORGE_PUBLIC_INDEXING === "true" && Boolean(process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(join(root, "src/static/assets"), join(out, "assets"), { recursive: true });
await cp(join(root, "src/static/site.webmanifest"), join(out, "site.webmanifest"));
await mkdir(join(out, "assets/modules"), { recursive: true });
await cp(join(root, "src/lib"), join(out, "assets/modules/lib"), { recursive: true });
await cp(join(root, "src/content"), join(out, "assets/modules/content"), { recursive: true });

const interactive = ["/assets/app.js"];
const routes = [
  { path: "/", title: "BurgerForge AI", description: "Build structured burger ideas, choose a Devour Board and keep a private tasting journal.", main: homePage(), scripts: interactive, bodyClass: "home-page" },
  { path: "/builder/", title: "AI Burger Builder", description: "Turn a bounded flavour brief into three structured burger concepts with a safe local fallback.", main: builderPage(), scripts: interactive, bodyClass: "builder-page", private: true },
  { path: "/ideas/", title: "Curated Burger Ideas", description: "Explore eight original burger blueprints and add selected concepts to a private board.", main: ideasPage(), scripts: interactive, bodyClass: "ideas-page" },
  { path: "/board/", title: "Devour Board", description: "Manage queued and devoured burger concepts without accounts or full-page reloads.", main: boardPage(), scripts: interactive, bodyClass: "board-page", private: true },
  { path: "/journal/", title: "Tasting Journal", description: "Rate devoured burger ideas and save private browser-local tasting notes.", main: journalPage(), scripts: interactive, bodyClass: "journal-page", private: true },
  { path: "/about/", title: "Product and Architecture", description: "See how Eat Da Burger and the Vercel AI SDK concepts were consolidated into one focused product.", main: aboutPage(), bodyClass: "about-page" },
  { path: "/safety/", title: "Food and AI Safety", description: "Understand BurgerForge dietary, allergen, nutrition, preparation and AI limitations.", main: safetyPage(), bodyClass: "safety-page" },
  { path: "/privacy/", title: "Privacy", description: "Understand local board storage and the optional same-origin AI preference request.", main: privacyPage(), bodyClass: "privacy-page" },
  { path: "/offline/", title: "Offline Mode", description: "Use curated ideas and local workspaces when live provider generation is unavailable.", main: offlinePage(), bodyClass: "offline-page", private: true },
  { path: "/404/", title: "Page Not Found", description: "The requested BurgerForge AI page could not be found.", main: notFoundPage(), bodyClass: "not-found-page", private: true, status: 404 }
];
const fileFor = path => path === "/" ? join(out, "index.html") : join(out, path.replace(/^\//, ""), "index.html");
for (const route of routes) {
  const robots = route.private ? "noindex,nofollow" : indexable ? "index,follow" : "noindex,follow";
  const html = renderDocument({ ...route, robots });
  const file = fileFor(route.path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  if (route.path === "/404/") await writeFile(join(out, "404.html"), html);
}
const origin = (process.env.SITE_URL || "").replace(/\/$/, "") || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")}` : "");
const publicRoutes = routes.filter(route => !route.private && route.path !== "/404/");
await writeFile(join(out, "robots.txt"), indexable ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n");
await writeFile(join(out, "sitemap.xml"), indexable ? `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicRoutes.map(route => `<url><loc>${origin}${route.path}</loc></url>`).join("")}</urlset>` : '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
await mkdir(join(out, ".well-known"), { recursive: true });
await writeFile(join(out, ".well-known/security.txt"), `Contact: https://github.com/princeinoba/eat-da-burger/security/advisories/new\nPreferred-Languages: en\nExpires: 2027-07-29T00:00:00Z\n`);
const version = createHash("sha256").update(routes.map(route => route.path).join("|")).digest("hex").slice(0, 12);
const precache = ["/", "/ideas/", "/builder/", "/board/", "/journal/", "/about/", "/safety/", "/privacy/", "/offline/", "/404/", "/assets/site.css", "/assets/site.js", "/assets/app.js", "/assets/icons/favicon.svg", "/assets/icons/icon-192.png", "/assets/icons/icon-512.png", "/site.webmanifest"];
const sw = await readFile(join(root, "src/static/sw.js"), "utf8");
await writeFile(join(out, "sw.js"), sw.replace("__CACHE_VERSION__", version).replace("__PRECACHE__", JSON.stringify(precache)));
console.log(`Built ${routes.length} canonical documents into dist.`);
