// Muestra una estructura capa por capa en ASCII (para estudiar cómo están hechas las de vanilla).
// Uso: node tools/village/dump.mjs vanilla:village/plains/houses/plains_medium_house_1
import { loadStructure } from "./preview.mjs";
const s = loadStructure(process.argv[2]);
const legend = new Map(); const sym = "#=%&@$*+~^ox0123456789abcdefghijklmnpqrstuvwyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ch = (b) => { const id = b && b.n; if (!id || /air$/.test(id)) return "."; if (!legend.has(id)) legend.set(id, sym[legend.size % sym.length]); return legend.get(id); };
for (let y = 0; y < s.sy; y++) {
  console.log(`--- capa y=${y}`);
  for (let z = 0; z < s.sz; z++) { let row = ""; for (let x = 0; x < s.sx; x++) row += ch(s.get(x, y, z)); console.log(row); }
}
console.log([...legend].map(([k, v]) => `${v}=${k.replace("minecraft:", "")}`).join("  "));
