// Construye tools/.ids.json con los IDs que existen en el pack (leyendo los jars), para que
// tools/gen-quests.mjs pueda validar objetos, entidades, logros, estructuras y biomas de las misiones.
// Uso:  node tools/build-id-index.mjs
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modsDir = join(root, "server", "mods");
const client = join(process.env.APPDATA || "", "PrismLauncher", "libraries", "com", "mojang", "minecraft", "1.20.1", "minecraft-1.20.1-client.jar");

const jars = readdirSync(modsDir).filter((f) => f.endsWith(".jar")).map((f) => join(modsDir, f));
if (existsSync(client)) jars.push(client);
else console.warn("AVISO: no se encontró el jar de Minecraft; los IDs vanilla no se validarán:", client);

const items = new Set(), entities = new Set(), advancements = new Set(), structures = new Set(), biomes = new Set(), fluids = new Set();
const unzip = (jar, file) => {
  try { return execFileSync("unzip", ["-p", jar, file], { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8"); }
  catch { return ""; }
};
const list = (jar) => {
  try { return execFileSync("unzip", ["-Z1", jar], { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8").split("\n"); }
  catch { return []; }
};

for (const jar of jars) {
  const files = list(jar);
  for (const f of files) {
    let m;
    if ((m = /^assets\/([a-z0-9_.-]+)\/lang\/en_us\.json$/.exec(f))) {
      const ns = m[1];
      // regex sobre el texto (algunos lang no son JSON estricto)
      const text = unzip(jar, f);
      for (const mm of text.matchAll(/"(item|block|entity).([a-z0-9_-]+).([a-z0-9_./-]+)"s*:/g)) {
        (mm[1] === "entity" ? entities : items).add(`${mm[2]}:${mm[3]}`);
      }
    } else if ((m = /^data\/([a-z0-9_.-]+)\/advancements\/(.+)\.json$/.exec(f))) advancements.add(`${m[1]}:${m[2]}`);
    else if ((m = /^data\/([a-z0-9_.-]+)\/worldgen\/structure\/(.+)\.json$/.exec(f))) structures.add(`${m[1]}:${m[2]}`);
    else if ((m = /^data\/([a-z0-9_.-]+)\/worldgen\/biome\/(.+)\.json$/.exec(f))) biomes.add(`${m[1]}:${m[2]}`);
  }
}
const sort = (s) => [...s].sort();
writeFileSync(join(root, "tools", ".ids.json"), JSON.stringify({ items: sort(items), entities: sort(entities), advancements: sort(advancements), structures: sort(structures), biomes: sort(biomes) }));
console.log(`jars: ${jars.length}  items: ${items.size}  entidades: ${entities.size}  logros: ${advancements.size}  estructuras: ${structures.size}  biomas: ${biomes.size}`);
