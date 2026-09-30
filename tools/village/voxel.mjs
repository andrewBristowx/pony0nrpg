// Cuadrícula de bloques + exportación a NBT de estructura de Minecraft 1.20.1 (se coloca con /place template).
import { T, writeNbt } from "./nbt.mjs";

export const DATA_VERSION = 3465;   // Minecraft 1.20.1

/** Bloque: "minecraft:oak_planks" o { n: "minecraft:oak_stairs", p: { facing: "north", half: "bottom" }, nbt: {...} } */
export const b = (n, p, nbt) => ({ n: n.includes(":") ? n : "minecraft:" + n, p: p || {}, nbt });

const key = (blk) => blk.n + "[" + Object.keys(blk.p).sort().map((k) => `${k}=${blk.p[k]}`).join(",") + "]";

export class Voxels {
  constructor(sx, sy, sz) { this.sx = sx; this.sy = sy; this.sz = sz; this.cells = new Map(); }
  inside(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.sx && y < this.sy && z < this.sz; }
  set(x, y, z, blk) {
    x = Math.round(x); y = Math.round(y); z = Math.round(z);
    if (!this.inside(x, y, z)) return;
    const k = (y * this.sz + z) * this.sx + x;
    if (blk === null || blk === undefined) this.cells.delete(k); else this.cells.set(k, typeof blk === "string" ? b(blk) : blk);
  }
  get(x, y, z) { return this.cells.get((y * this.sz + z) * this.sx + x) || null; }
  fill(x0, y0, z0, x1, y1, z1, blk) {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, z, blk);
  }
  /** caja hueca (solo paredes, sin suelo ni techo) */
  walls(x0, y0, z0, x1, y1, z1, blk) {
    for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (x === x0 || x === x1 || z === z0 || z === z1) this.set(x, y, z, blk);
  }
  /** vacía un volumen */
  clear(x0, y0, z0, x1, y1, z1) { this.fill(x0, y0, z0, x1, y1, z1, null); }

  toNbt() {
    const palette = [], index = new Map(), blocks = [];
    for (const [k, blk] of this.cells) {
      const pk = key(blk);
      if (!index.has(pk)) { index.set(pk, palette.length); palette.push(blk); }
      const x = k % this.sx, z = Math.floor(k / this.sx) % this.sz, y = Math.floor(k / (this.sx * this.sz));
      const entry = { pos: T.list([T.int(x), T.int(y), T.int(z)], "int"), state: T.int(index.get(pk)) };
      if (blk.nbt) entry.nbt = blk.nbt;
      blocks.push(T.comp(entry));
    }
    blocks.sort((p, q) => { const a = p.v.pos.v.map((t) => t.v), c = q.v.pos.v.map((t) => t.v); return a[1] - c[1] || a[2] - c[2] || a[0] - c[0]; });
    const pal = palette.map((blk) => {
      const o = { Name: T.str(blk.n) };
      if (Object.keys(blk.p).length) o.Properties = T.comp(Object.fromEntries(Object.entries(blk.p).map(([k, v]) => [k, T.str(String(v))])));
      return T.comp(o);
    });
    return writeNbt(T.comp({
      DataVersion: T.int(DATA_VERSION),
      size: T.list([T.int(this.sx), T.int(this.sy), T.int(this.sz)], "int"),
      palette: T.list(pal, "comp"),
      blocks: T.list(blocks, "comp"),
      entities: T.list([], "comp"),
    }));
  }
}

// ---- constructores de bloques con propiedades ---------------------------------------------------------------------
export const stairs = (mat, facing, half = "bottom") => b(`${mat}_stairs`, { facing, half, shape: "straight", waterlogged: "false" });
export const slab = (mat, type = "bottom") => b(`${mat}_slab`, { type, waterlogged: "false" });
export const log = (mat, axis = "y") => b(`${mat}_log`, { axis });
export const door = (mat, facing, half, hinge = "left", open = false) => b(`${mat}_door`, { facing, half, hinge, open: String(open), powered: "false" });
export const trapdoor = (mat, facing, open = true, half = "bottom") => b(`${mat}_trapdoor`, { facing, half, open: String(open), powered: "false", waterlogged: "false" });
export const fence = (mat) => b(`${mat}_fence`, { waterlogged: "false" });
export const fenceGate = (mat, facing, open = false) => b(`${mat}_fence_gate`, { facing, open: String(open), powered: "false", in_wall: "false" });
export const wall = (mat) => b(`${mat}_wall`, { up: "true", waterlogged: "false" });
export const lantern = (hanging = false) => b("lantern", { hanging: String(hanging), waterlogged: "false" });
export const chest = (facing) => b("chest", { facing, type: "single", waterlogged: "false" });
export const barrel = (facing = "up") => b("barrel", { facing, open: "false" });
export const furnace = (name, facing) => b(name, { facing, lit: "false" });
export const wallTorch = (facing) => b("wall_torch", { facing });
export const bed = (color, facing, part) => b(`${color}_bed`, { facing, part, occupied: "false" });
export const banner = (color, rotation = 0) => b(`${color}_banner`, { rotation: String(rotation) });
export const wallBanner = (color, facing) => b(`${color}_wall_banner`, { facing });
export const carpet = (color) => b(`${color}_carpet`);
export const bookshelf = () => b("bookshelf");
export const hay = (axis = "y") => b("hay_block", { axis });
export const glassPane = (color) => b(color ? `${color}_stained_glass_pane` : "glass_pane", { north: "false", south: "false", east: "false", west: "false", waterlogged: "false" });
export const crop = (name, age) => b(name, { age: String(age) });
export const farmland = () => b("farmland", { moisture: "7" });
export const lever = () => b("lever", { face: "wall", facing: "north", powered: "false" });
export const anvil = (facing) => b("anvil", { facing });
export const grindstone = (facing) => b("grindstone", { face: "floor", facing });
export const campfire = (facing) => b("campfire", { facing, lit: "false", signal_fire: "false", waterlogged: "false" });
export const cauldronWater = () => b("water_cauldron", { level: "3" });
export const flowerPot = (flower) => b(flower ? `potted_${flower}` : "flower_pot");
export const leaves = (mat) => b(`${mat}_leaves`, { distance: "1", persistent: "true", waterlogged: "false" });
export const water = () => b("water", { level: "0" });

/** cartel de pared con texto (1.20: front_text) */
export function wallSign(mat, facing, lines) {
  const msgs = [0, 1, 2, 3].map((i) => T.str(JSON.stringify({ text: lines[i] || "" })));
  const nbt = T.comp({
    front_text: T.comp({ messages: T.list(msgs, "str"), color: T.str("black"), has_glowing_text: T.byte(0) }),
    back_text: T.comp({ messages: T.list([0, 1, 2, 3].map(() => T.str(JSON.stringify({ text: "" }))), "str"), color: T.str("black"), has_glowing_text: T.byte(0) }),
    is_waxed: T.byte(1),
  });
  return b(`${mat}_wall_sign`, { facing, waterlogged: "false" }, nbt);
}

export const OPP = { north: "south", south: "north", east: "west", west: "east" };
export const DIRS = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };
