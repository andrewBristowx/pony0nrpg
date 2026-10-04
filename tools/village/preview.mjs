// Vista isométrica (PNG) de una estructura .nbt de Minecraft, con los colores reales de las texturas del juego.
// Sirve para COMPROBAR lo que genera tools/village/gen-village.mjs y compararlo con estructuras de referencia de vanilla.
// Uso:  node tools/village/preview.mjs <ruta.nbt | vanilla:village/plains/houses/plains_big_house_1> <salida.png> [escala=6] [rotar=0..3]
import { readFileSync, writeFileSync } from "node:fs";
import { inflateRawSync, deflateSync, inflateSync } from "node:zlib";
import { join } from "node:path";
import { readNbt } from "./nbt.mjs";

export const CLIENT_JAR = join(process.env.APPDATA || "", "PrismLauncher", "libraries", "com", "mojang", "minecraft", "1.20.1", "minecraft-1.20.1-client.jar");

// ---- lector de zip mínimo ----------------------------------------------------------------------------------------
export function openZip(file) {
  const buf = readFileSync(file);
  let eocd = buf.length - 22;
  while (eocd > 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const count = buf.readUInt16LE(eocd + 10), cdOff = buf.readUInt32LE(eocd + 16);
  const map = new Map();
  let p = cdOff;
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), elen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    map.set(buf.toString("utf8", p + 46, p + 46 + nlen), { method, csize, off });
    p += 46 + nlen + elen + clen;
  }
  return {
    has: (n) => map.has(n),
    read(n) {
      const e = map.get(n); if (!e) return null;
      const nlen = buf.readUInt16LE(e.off + 26), elen = buf.readUInt16LE(e.off + 28);
      const raw = buf.subarray(e.off + 30 + nlen + elen, e.off + 30 + nlen + elen + e.csize);
      return e.method === 0 ? raw : inflateRawSync(raw);
    },
  };
}

// ---- PNG: decodificar (8 bits) y codificar -----------------------------------------------------------------------
function decodePng(buf) {
  let p = 8, w = 0, h = 0, ct = 0, bd = 8; const idat = []; let plte = null, trns = null;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString("ascii", p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
    else if (type === "PLTE") plte = data; else if (type === "tRNS") trns = data; else if (type === "IDAT") idat.push(data);
    p += 12 + len;
  }
  if (bd !== 8) return null;
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ct]; const bpp = ch;
  const raw = inflateSync(Buffer.concat(idat)); const stride = w * ch; const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0, b = y > 0 ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let r;
      if (f === 0) r = v; else if (f === 1) r = v + a; else if (f === 2) r = v + b; else if (f === 3) r = v + ((a + b) >> 1);
      else { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      out[y * stride + x] = r & 255;
    }
  }
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    let r, g, b, a = 255;
    if (ct === 6) [r, g, b, a] = [out[i * 4], out[i * 4 + 1], out[i * 4 + 2], out[i * 4 + 3]];
    else if (ct === 2) [r, g, b] = [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]];
    else if (ct === 3) { const k = out[i]; [r, g, b] = [plte[k * 3], plte[k * 3 + 1], plte[k * 3 + 2]]; if (trns && k < trns.length) a = trns[k]; }
    else if (ct === 0) r = g = b = out[i]; else { r = g = b = out[i * 2]; a = out[i * 2 + 1]; }
    rgba.set([r, g, b, a], i * 4);
  }
  return { w, h, rgba };
}
const crcTable = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc32 = (b) => { let c = -1; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
export function encodePng(w, h, rgb) {
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

// ---- color medio de cada bloque ----------------------------------------------------------------------------------
let jar = null; const colorCache = new Map();
function avgTexture(name) {
  const f = `assets/minecraft/textures/block/${name}.png`;
  if (!jar.has(f)) return null;
  const png = decodePng(jar.read(f)); if (!png) return null;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < png.w * png.h; i++) { if (png.rgba[i * 4 + 3] < 40) continue; r += png.rgba[i * 4]; g += png.rgba[i * 4 + 1]; b += png.rgba[i * 4 + 2]; n++; }
  return n ? [r / n, g / n, b / n] : null;
}
export function blockColor(id) {
  jar = jar || openZip(CLIENT_JAR);
  const name = id.replace("minecraft:", "");
  if (colorCache.has(name)) return colorCache.get(name);
  const base = name.replace(/_(stairs|slab|fence_gate|fence|wall|button|pressure_plate|sign|wall_sign|hanging_sign|trapdoor|door)$/, "");
  const wood = base.replace(/_(planks)$/, "");
  const cands = [name, `${name}_side`, `${name}_top`, base, `${base}_planks`, `${base}s`, `${base}_block`, `${base}_side`, `${base}_top`, `${wood}_planks`,
    name.replace("_wall_torch", "_torch").replace("wall_torch", "torch"), name.replace("_pane", ""), `${name}_bottom`, `${name}_door_top`, name.replace("_stained_glass_pane", "_stained_glass"),
    name.replace("smooth_", ""), name.replace("polished_", ""), name.replace("cut_", ""), name.replace("chiseled_", ""), name.replace("_wood", "_log"), name.replace("stripped_", ""),
    name.replace("potted_", ""), name.replace("_wall_banner", "_wool").replace("_banner", "_wool"), name.replace("_bed", "_wool"), name.replace("_carpet", "_wool"), name.replace("_candle", "") ];
  let c = null;
  for (const k of cands) { c = avgTexture(k); if (c) break; }
  if (!c) c = /water/.test(name) ? [60, 90, 200] : /leaves/.test(name) ? [60, 130, 50] : /grass/.test(name) ? [100, 160, 60] : /lantern|torch/.test(name) ? [240, 200, 90] : [150, 150, 150];
  colorCache.set(name, c); return c;
}

// ---- cargar estructura -------------------------------------------------------------------------------------------
export function loadStructure(spec) {
  jar = jar || openZip(CLIENT_JAR);
  let buf;
  if (spec.startsWith("vanilla:")) buf = jar.read(`data/minecraft/structures/${spec.slice(8)}.nbt`);
  else buf = readFileSync(spec);
  if (!buf) throw new Error("no encontrada: " + spec);
  const nbt = readNbt(buf);
  const [sx, sy, sz] = nbt.size;
  const palette = nbt.palette.map((p) => ({ n: p.Name, p: p.Properties || {} }));
  const grid = new Array(sx * sy * sz).fill(null);
  for (const b of nbt.blocks) { const [x, y, z] = b.pos; grid[(y * sz + z) * sx + x] = palette[b.state]; }
  return { sx, sy, sz, get: (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= sx || y >= sy || z >= sz ? null : grid[(y * sz + z) * sx + x]) };
}
const INVISIBLE = /^minecraft:(air|cave_air|void_air|structure_void|barrier|jigsaw|light)$/;
const PARTIAL = /stairs|slab|_pane$|_door$|trapdoor|fence|_wall$|torch|lantern|carpet|banner|_bed$|ladder|flower_pot|candle|chest|anvil|grindstone|lectern|campfire|bars|sign|button|plate|cauldron|crop|wheat|carrots|potatoes|beetroots|grass|fern|flower|tulip|poppy|dandelion|rose|allium|azure|cornflower|lily|sugar_cane|bell|chain|sapling|vine/;

// cajas [x0,y0,z0,x1,y1,z1] (0..1 dentro de la celda) que ocupa un bloque, para poder ver escaleras, losas, cristales, vallas…
const SIDE = { north: [0, 0, 1, 0.5], south: [0, 0.5, 1, 1], west: [0, 0, 0.5, 1], east: [0.5, 0, 1, 1] };
const THIN = { north: [0, 0, 0.8, 1, 1, 1], south: [0, 0, 0, 1, 1, 0.2], west: [0.8, 0, 0, 1, 1, 1], east: [0, 0, 0, 0.2, 1, 1] };
function boxesOf(b, nb) {
  const n = b.n.replace("minecraft:", ""), p = b.p;
  if (/stairs$/.test(n)) {
    const top = p.half === "top", bx = SIDE[p.facing] || SIDE.north;
    return [[0, top ? 0.5 : 0, 0, 1, top ? 1 : 0.5, 1], [bx[0], top ? 0 : 0.5, bx[1], bx[2], top ? 0.5 : 1, bx[3]]];
  }
  if (/slab$/.test(n)) { if (p.type === "double") return [[0, 0, 0, 1, 1, 1]]; return p.type === "top" ? [[0, 0.5, 0, 1, 1, 1]] : [[0, 0, 0, 1, 0.5, 1]]; }
  if (/_trapdoor$/.test(n)) { if (p.open === "true") return [THIN[p.facing] || THIN.north]; return p.half === "top" ? [[0, 0.8, 0, 1, 1, 1]] : [[0, 0, 0, 1, 0.2, 1]]; }
  if (/_door$/.test(n)) {
    const f = p.facing, open = p.open === "true", hinge = p.hinge === "right"; let side = f;
    if (open) side = { north: hinge ? "east" : "west", south: hinge ? "west" : "east", east: hinge ? "south" : "north", west: hinge ? "north" : "south" }[f];
    return [THIN[side] || THIN.north];
  }
  if (/(_pane|iron_bars)$/.test(n)) return nb.xz ? [[0, 0, 0.45, 1, 1, 0.55]] : [[0.45, 0, 0, 0.55, 1, 1]];
  if (/fence$|_wall$/.test(n)) return [[0.35, 0, 0.35, 0.65, 1, 0.65]];
  if (/fence_gate$/.test(n)) return [[0, 0.3, 0.4, 1, 1, 0.6]];
  if (/torch$/.test(n)) return [[0.42, 0, 0.42, 0.58, 0.7, 0.58]];
  if (/lantern$/.test(n)) return [[0.3, p.hanging === "true" ? 0.1 : 0, 0.3, 0.7, p.hanging === "true" ? 0.6 : 0.5, 0.7]];
  if (/carpet$|pressure_plate$/.test(n)) return [[0, 0, 0, 1, 0.08, 1]];
  if (/banner$/.test(n)) return [[0.45, 0, 0.45, 0.55, 1, 0.55]];
  if (/_bed$/.test(n)) return [[0, 0, 0, 1, 0.55, 1]];
  if (/ladder$|button$|vine$|sign$/.test(n)) return [[0.42, 0.1, 0.42, 0.58, 0.9, 0.58]];
  if (/flower_pot|potted|candle|cauldron|anvil|grindstone|lectern|campfire|bell|chain|chest/.test(n)) return [[0.15, 0, 0.15, 0.85, 0.7, 0.85]];
  if (/wheat|carrots|potatoes|beetroots|grass|fern|flower|tulip|poppy|dandelion|rose|allium|azure|cornflower|lily|sugar_cane|sapling/.test(n)) return [[0.25, 0, 0.25, 0.75, 0.7, 0.75]];
  return [[0, 0, 0, 1, 1, 1]];
}
const isFull = (b) => !!b && !INVISIBLE.test(b.n) && !PARTIAL.test(b.n.replace("minecraft:", ""));

// ---- render isométrico -------------------------------------------------------------------------------------------
export function render(struct, a = 6, rot = 0) {
  const { sx, sy, sz } = struct;
  const dimsAt = (r) => (r % 2 ? [sz, sx] : [sx, sz]);   // [ancho, fondo] de la cuadrícula tras r giros
  const get = (x, y, z) => { let X = x, Z = z; for (let r = rot; r > 0; r--) { const [w0] = dimsAt(r); [X, Z] = [Z, w0 - 1 - X]; } return struct.get(X, y, Z); };
  const ROT = { north: "east", east: "south", south: "west", west: "north" };   // al rotar la vista también rota el facing
  const W = rot % 2 ? sz : sx, D = rot % 2 ? sx : sz;
  const width = Math.ceil((W + D) * a + 4 * a), height = Math.ceil((W + D) * a / 2 + sy * a + 4 * a);
  const img = Buffer.alloc(width * height * 3); for (let i = 0; i < img.length; i += 3) { img[i] = 205; img[i + 1] = 226; img[i + 2] = 240; }
  const ox = D * a + 2 * a, oy = 2 * a + sy * a;
  const poly = (pts, col) => {
    const ys = pts.map((q) => q[1]); const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(height - 1, Math.ceil(Math.max(...ys)));
    for (let y = y0; y <= y1; y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) { const [x1, y1p] = pts[i], [x2, y2p] = pts[(i + 1) % pts.length]; if ((y1p <= y + 0.5 && y2p > y + 0.5) || (y2p <= y + 0.5 && y1p > y + 0.5)) xs.push(x1 + ((y + 0.5 - y1p) / (y2p - y1p)) * (x2 - x1)); }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(width, Math.round(xs[k + 1])); x++) { const o = (y * width + x) * 3; img[o] = col[0]; img[o + 1] = col[1]; img[o + 2] = col[2]; }
    }
  };
  const proj = (X, Y, Z) => [ox + (X - Z) * a, oy + (X + Z) * a / 2 - Y * a];
  for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) for (let y = 0; y < sy; y++) {
    const raw = get(x, y, z); if (!raw || INVISIBLE.test(raw.n)) continue;
    let b = raw;
    if (rot && raw.p.facing) { let f = raw.p.facing; for (let r = 0; r < rot; r++) f = ROT[f] || f; b = { n: raw.n, p: { ...raw.p, facing: f } }; }
    if (isFull(b) && isFull(get(x, y + 1, z)) && isFull(get(x, y, z + 1)) && isFull(get(x + 1, y, z))) continue;   // oculto
    const c = blockColor(b.n);
    const isW = (xx, zz) => { const q = get(xx, y, zz); return !!q && !INVISIBLE.test(q.n); };
    const sh = (k) => [Math.min(255, c[0] * k), Math.min(255, c[1] * k), Math.min(255, c[2] * k)];
    for (const [bx0, by0, bz0, bx1, by1, bz1] of boxesOf(b, { xz: isW(x - 1, z) || isW(x + 1, z) })) {
      const X0 = x + bx0, X1 = x + bx1, Y0 = y + by0, Y1 = y + by1, Z0 = z + bz0, Z1 = z + bz1;
      poly([proj(X0, Y1, Z1), proj(X1, Y1, Z1), proj(X1, Y0, Z1), proj(X0, Y0, Z1)], sh(0.78));
      poly([proj(X1, Y1, Z0), proj(X1, Y1, Z1), proj(X1, Y0, Z1), proj(X1, Y0, Z0)], sh(0.58));
      poly([proj(X0, Y1, Z0), proj(X1, Y1, Z0), proj(X1, Y1, Z1), proj(X0, Y1, Z1)], sh(1.08));
    }
  }
  return { width, height, img };
}

// ---- CLI ---------------------------------------------------------------------------------------------------------
if (process.argv[1] && process.argv[1].endsWith("preview.mjs")) {
  const [spec, out, scale, rot] = process.argv.slice(2);
  if (!spec || !out) { console.error("uso: node preview.mjs <ruta.nbt|vanilla:...> <salida.png> [escala] [rotar]"); process.exit(1); }
  let s = loadStructure(spec);
  if (process.env.CROP) {   // CROP="x0,z0,x1,z1[,ymax]" recorta una zona para verla con más detalle
    const [cx0, cz0, cx1, cz1, cy1] = process.env.CROP.split(",").map(Number), full = s;
    s = { sx: cx1 - cx0 + 1, sz: cz1 - cz0 + 1, sy: cy1 ? cy1 + 1 : full.sy, get: (x, y, z) => full.get(x + cx0, y, z + cz0) };
  }
  const { width, height, img } = render(s, Number(scale || 6), Number(rot || 0));
  writeFileSync(out, encodePng(width, height, img));
  console.log(`${spec}: ${s.sx}x${s.sy}x${s.sz} -> ${out} (${width}x${height})`);
}
