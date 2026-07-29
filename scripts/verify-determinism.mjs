import { createHash } from "node:crypto";
import { cp, mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));async function files(dir){const entries=await readdir(dir,{withFileTypes:true});const result=[];for(const entry of entries){const path=join(dir,entry.name);if(entry.isDirectory())result.push(...await files(path));else result.push(path);}return result;}
async function manifest(dir){const all=await files(dir);const entries=[];for(const path of all){const bytes=await readFile(path);entries.push([relative(dir,path).replaceAll("\\","/"),createHash("sha256").update(bytes).digest("hex"),(await stat(path)).size]);}return entries.sort((a,b)=>a[0].localeCompare(b[0]));}
const first=await manifest(join(root,"dist"));const temp=await mkdtemp(join(tmpdir(),"burgerforge-determinism-"));try{for(const name of ["api","scripts","src","tests","package.json","package-lock.json","vercel.json",".env.example",".gitignore",".npmrc",".nvmrc","README.md","AGENTS.md","DEPLOYMENT.md","SECURITY.md","NOTICE.md","docs"]){const from=join(root,name);try{await cp(from,join(temp,name),{recursive:true});}catch{}}
const run=spawnSync(process.execPath,[join(temp,"scripts/build.mjs")],{cwd:temp,encoding:"utf8"});if(run.status!==0)throw new Error(run.stderr||run.stdout);const second=await manifest(join(temp,"dist"));if(JSON.stringify(first)!==JSON.stringify(second))throw new Error("Build outputs are not deterministic.");const tree=createHash("sha256").update(JSON.stringify(first)).digest("hex");console.log(`Deterministic comparison passed for ${first.length} files. Generated-tree SHA-256: ${tree}`);}finally{await rm(temp,{recursive:true,force:true});}
