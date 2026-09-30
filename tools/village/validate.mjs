// Comprueba que cada bloque de una estructura existe en vanilla 1.20.1 y que sus propiedades son válidas (contra los blockstates del cliente).
// Uso: node tools/village/validate.mjs kubejs/data/pony0n/structures/pueblo_tuliondor.nbt
import { readFileSync } from "node:fs";
import { readNbt } from "./nbt.mjs";
import { openZip, CLIENT_JAR } from "./preview.mjs";

const jar = openZip(CLIENT_JAR);
const s = readNbt(readFileSync(process.argv[2]));
let bad = 0;
const seen = new Set();
for (const p of s.palette) {
  const name = p.Name.replace("minecraft:", "");
  if (!p.Name.startsWith("minecraft:")) { console.log("no vanilla:", p.Name); continue; }
  const raw = jar.read(`assets/minecraft/blockstates/${name}.json`);
  if (!raw) { console.log("BLOQUE INEXISTENTE:", p.Name); bad++; continue; }
  const bs = JSON.parse(raw.toString());
  if (bs.variants) {
    const keys = Object.keys(bs.variants);
    const props = new Set(keys.filter((k) => k).flatMap((k) => k.split(",").map((kv) => kv.split("=")[0])));
    const allowed = {}; for (const k of keys) for (const kv of k.split(",")) { if (!kv) continue; const [a, c] = kv.split("="); (allowed[a] ||= new Set()).add(c); }
    for (const [k, val] of Object.entries(p.Properties || {})) {
      if (!seen.has(name + k)) {
        if (!props.has(k) && props.size) { /* puede ser propiedad sin efecto visual (waterlogged, powered, ...) */ }
        if (allowed[k] && !allowed[k].has(val)) { console.log(`VALOR RARO ${p.Name} ${k}=${val} (válidos: ${[...allowed[k]].join("|")})`); bad++; }
        seen.add(name + k);
      }
    }
    // combinación completa
    if (keys.length > 1 || keys[0] !== "") {
      const have = Object.keys(p.Properties || {}).filter((k) => props.has(k));
      const combo = have.sort().map((k) => `${k}=${p.Properties[k]}`);
      const ok = keys.some((k) => { const parts = k.split(",").sort(); return combo.every((c) => parts.includes(c)) && parts.length === combo.length; });
      if (!ok && !seen.has("c" + name + combo)) { console.log(`COMBINACIÓN SIN VARIANTE ${p.Name} [${combo}]`); seen.add("c" + name + combo); bad++; }
    }
  }
}
console.log(`${s.palette.length} estados, ${s.blocks.length} bloques; problemas: ${bad}`);
