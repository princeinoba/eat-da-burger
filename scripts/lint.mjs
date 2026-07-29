import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const excluded = new Set([".git", ".vercel", "node_modules", "dist", "docs/evidence"]);
async function files(dir) { const entries=await readdir(dir,{withFileTypes:true}); const result=[]; for(const entry of entries){const path=join(dir,entry.name);const rel=relative(root,path).replaceAll("\\","/");if([...excluded].some(value=>rel===value||rel.startsWith(`${value}/`)))continue;if(entry.isDirectory())result.push(...await files(path));else result.push(path);}return result; }
const all=await files(root); const scripts=all.filter(path=>[".js",".mjs"].includes(extname(path))); for(const path of scripts){const check=spawnSync(process.execPath,["--check",path],{encoding:"utf8"});if(check.status!==0){process.stderr.write(check.stderr);process.exit(1);}}
const policyFiles=all.filter(path=>[".js",".mjs",".json",".md",".html",".css"].includes(extname(path))); const codePolicyFiles=policyFiles.filter(path=>{const rel=relative(root,path).replaceAll("\\","/");return /^(src|api|scripts|tests)\//.test(rel)&&rel!=="scripts/lint.mjs";}); const forbidden=[/REACT_APP_/i,/NEXT_PUBLIC_/i,/VITE_[A-Z_]+/i,/mongodb(?:\+srv)?:\/\//i,/mysql:\/\//i,/sk-[A-Za-z0-9_-]{20,}/,/AKIA[0-9A-Z]{16}/,/location\.reload\s*\(/,/from\s+["'](?:react|next|express|mysql2|ai|@ai-sdk\/) /];
for(const path of codePolicyFiles){const text=await readFile(path,"utf8");for(const pattern of forbidden){if(pattern.test(text)){console.error(`Policy violation ${pattern} in ${relative(root,path)}`);process.exit(1);}}}
const packageJson=JSON.parse(await readFile(join(root,"package.json"),"utf8"));if(Object.keys(packageJson.dependencies||{}).length||Object.keys(packageJson.devDependencies||{}).length){throw new Error("External npm dependencies require explicit approval.");}
console.log(`${scripts.length} JavaScript files passed syntax checks; ${policyFiles.length} files passed policy checks.`);
