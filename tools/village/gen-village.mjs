// Generador del pueblo inicial de gremio. Uso: node tools/village/gen-village.mjs [gremio|all] [salidaDir]
// Produce <salidaDir>/pueblo_<gremio>.nbt (estructura de Minecraft) y tools/village/out/pueblo_<gremio>.json (posiciones de NPC, spawn y tamaño).
// Plantilla de 97 x 34 x 97: y=0..2 cimentación de tierra, y=3 suelo (SURF), el pueblo sube desde y=4.
// Ejes: x = este, z = sur. El Gran Salón del gremio está al norte; la plaza con el pozo, en el centro.
import { writeFileSync, mkdirSync } from "node:fs";
import { Voxels, b, log, fence, lantern, chest, barrel, furnace, bed, wallBanner, carpet, bookshelf, crop, farmland,
  anvil, grindstone, flowerPot, leaves, water, OPP, DIRS } from "./voxel.mjs";
import { house, gableRoof, placeDoor, PALETTES, SURF } from "./buildings.mjs";

const G = SURF, N = 97, SY = 34, C = 48;
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const VEC_TO_FACING = (dx, dz) => (dx > 0 ? "east" : dx < 0 ? "west" : dz > 0 ? "south" : "north");
const hay = () => b("hay_block", { axis: "y" });
const hangLantern = () => b("lantern", { hanging: "true", waterlogged: "false" });
const chain = () => b("chain", { axis: "y", waterlogged: "false" });
const candle = (n, lit = true) => b("candle", { candles: String(n), lit: String(lit), waterlogged: "false" });
const stairBlk = (mat, f, half = "bottom") => b(`${mat}_stairs`, { facing: f, half, shape: "straight", waterlogged: "false" });
const slabBlk = (mat, type = "bottom") => b(`${mat}_slab`, { type, waterlogged: "false" });
const lectern = (f) => b("lectern", { facing: f, has_book: "false", powered: "false" });
const plate = (P) => b(`${P.trim}_pressure_plate`, { powered: "false" });

/** mapa local de una casa: u = a lo largo de la pared de la puerta, dv = hacia dentro (0 = fila pegada a la pared de la puerta) */
function localMap(h) {
  const { x0, z0, x1, z1, doorDir: d } = h;
  const inward = DIRS[OPP[d]];
  const uvec = d === "south" || d === "north" ? [1, 0] : [0, 1];
  const wallLen = d === "south" || d === "north" ? x1 - x0 + 1 : z1 - z0 + 1;
  const depth = d === "south" || d === "north" ? z1 - z0 + 1 : x1 - x0 + 1;
  const base = { south: [x0, z1], north: [x0, z0], east: [x1, z0], west: [x0, z0] }[d];
  return {
    U: wallLen - 2, D: depth - 2,
    at: (u, dv) => [base[0] + uvec[0] * (u + 1) + inward[0] * (dv + 1), base[1] + uvec[1] * (u + 1) + inward[1] * (dv + 1)],
    face: { in: VEC_TO_FACING(...inward), out: d, right: VEC_TO_FACING(...uvec), left: VEC_TO_FACING(-uvec[0], -uvec[1]) },
  };
}

const table = (v, x, z, P, y = G + 1) => { v.set(x, y, z, fence(P.trim)); v.set(x, y + 1, z, plate(P)); };

/** amuebla un piso de una casa (lvl = y del suelo: G en la planta baja, G+5 en la alta). Solo coloca donde hay suelo de tablones y el hueco está libre. */
function furnish(v, P, h, lvl, o, r) {
  const m = localMap(h), y = lvl + 1;
  const floorOk = (u, dv) => { const [x, z] = m.at(u, dv); const f = v.get(x, lvl, z); return !!f && /_planks$/.test(f.n); };
  const free = (u, dv, yy = y) => { const [x, z] = m.at(u, dv); return floorOk(u, dv) && !v.get(x, yy, z); };
  const put = (u, dv, blk, yy = y) => { const [x, z] = m.at(u, dv); v.set(x, yy, z, blk); };
  const back = m.D - 1;
  for (const u of o.beds) if (free(u, back) && free(u, back - 1)) { put(u, back, bed(P.color, m.face.in, "head")); put(u, back - 1, bed(P.color, m.face.in, "foot")); }
  if (free(m.U - 1, back)) put(m.U - 1, back, b("chest", { facing: m.face.out, type: "single", waterlogged: "false" }));
  if (free(m.U - 2, back)) { put(m.U - 2, back, bookshelf()); put(m.U - 2, back, bookshelf(), y + 1); }
  if (free(m.U - 1, back - 1)) { put(m.U - 1, back - 1, barrel("up")); put(m.U - 1, back - 1, lantern(false), y + 1); }   // el farol se apoya en el barril
  if (o.crafting && free(m.U - 1, 1)) put(m.U - 1, 1, b("crafting_table"));
  if (o.table) {
    const tu = Math.floor(m.U / 2), tdv = Math.min(2, m.D - 3);
    for (let u = tu - 1; u <= tu + 1; u++) for (let dv = tdv - 1; dv <= tdv + 1; dv++) if (free(u, dv)) put(u, dv, carpet(r() < 0.5 ? P.color : "white"));
    const [tx, tz] = m.at(tu, tdv), cur = v.get(tx, y, tz);
    if (floorOk(tu, tdv) && (!cur || cur.n.endsWith("_carpet"))) {
      table(v, tx, tz, P, y);
      for (const [du, f] of [[-1, m.face.left], [1, m.face.right]]) {   // sillas con el respaldo hacia fuera de la mesa
        const [cx, cz] = m.at(tu + du, tdv), q = v.get(cx, y, cz);
        if (floorOk(tu + du, tdv) && (!q || q.n.endsWith("_carpet"))) v.set(cx, y, cz, stairBlk(P.trim, f));
      }
    }
  }
  if (o.extraShelf && free(0, 1)) { put(0, 1, bookshelf()); put(0, 1, flowerPot(pick(r, ["poppy", "dandelion", "blue_orchid"])), y + 1); }
}

function yardDecor(v, P, h, r) {
  const [dx, dz] = DIRS[h.doorDir];
  const along = h.doorDir === "south" || h.doorDir === "north" ? [1, 0] : [0, 1];
  const bx = h.door[0] + dx * 2, bz = h.door[1] + dz * 2;
  for (const s of [-2, 2]) {
    const X = bx + along[0] * s, Z = bz + along[1] * s;
    if (v.get(X, G + 1, Z)) continue;
    v.set(X, G + 1, Z, r() < 0.5 ? barrel("up") : hay());
    v.set(X + dx, G + 1, Z + dz, pick(r, [b("poppy"), b("dandelion"), b("cornflower"), b("azure_bluet"), b("allium")]));
  }
  for (let k = 1; k <= 3; k++) v.set(h.door[0] + dx * k, G, h.door[1] + dz * k, b("dirt_path"));
}

/** cobertizo de herrería: fondo y laterales de piedra, frente abierto */
function forge(v, P, x0, z0, w, d) {
  const x1 = x0 + w - 1, z1 = z0 + d - 1, top = G + 4;
  v.fill(x0, G, z0, x1, G, z1, b("stone_bricks")); v.fill(x0 + 1, G, z0 + 1, x1 - 1, G, z1 - 1, b("cobblestone"));
  v.walls(x0, G + 1, z0, x1, top, z1, b("cobblestone"));
  v.clear(x0 + 1, G + 1, z1, x1 - 1, top, z1);
  v.walls(x0, G + 1, z0, x1, G + 1, z1, b("stone_bricks")); v.clear(x0 + 1, G + 1, z1, x1 - 1, G + 1, z1);
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) v.fill(cx, G + 1, cz, cx, top, cz, log(P.beam));
  for (let x = x0 + 1; x < x1; x++) { v.set(x, top, z0, log(P.beam, "x")); v.set(x, top, z1, log(P.beam, "x")); }
  for (let z = z0 + 1; z < z1; z++) { v.set(x0, top, z, log(P.beam, "z")); v.set(x1, top, z, log(P.beam, "z")); }
  for (const x of [x0 + Math.floor(w / 3), x1 - Math.floor(w / 3)]) v.fill(x, G + 1, z1, x, top - 1, z1, log(P.beam));
  const hts = gableRoof(v, P, x0, z0, x1, z1, top + 1, "x");
  for (const e of [x0, x1]) for (const { pos, y } of hts) if (pos >= z0 && pos <= z1) for (let yy = top + 1; yy < y; yy++) v.set(e, yy, pos, b("cobblestone"));
  const bz = z0 + 1;
  v.set(x0 + 1, G + 1, bz, furnace("furnace", "south")); v.set(x0 + 2, G + 1, bz, furnace("blast_furnace", "south")); v.set(x0 + 3, G + 1, bz, b("smithing_table"));
  v.set(x1 - 1, G + 1, bz, b("chest", { facing: "south", type: "single", waterlogged: "false" })); v.set(x1 - 2, G + 1, bz, barrel("up")); v.set(x1 - 2, G + 2, bz, lantern(false));
  v.set(x0 + 1, G + 1, z0 + 3, b("water_cauldron", { level: "3" }));
  const mx = Math.floor((x0 + x1) / 2);
  v.set(mx, G + 1, z0 + 3, anvil("east")); v.set(mx + 2, G + 1, z0 + 4, grindstone("north"));
  v.set(x1 - 1, G + 1, z0 + 4, b("lava_cauldron"));
  const cx = x0 + 2, cz = z0;
  v.fill(cx, G + 2, cz, cx, top + 5, cz, b("stone_bricks")); v.set(cx, top + 6, cz, slabBlk("stone_brick"));
  v.set(cx, G + 2, cz + 1, b("campfire", { facing: "south", lit: "false", signal_fire: "false", waterlogged: "false" }));
  for (const [lx, lz] of [[mx, z1], [mx - 3, z0 + 1], [mx + 3, z0 + 1]]) { v.set(lx, top, lz, log(P.beam, "x")); v.set(lx, top - 1, lz, hangLantern()); }
}

/** puesto de mercado de 5x3; front = lado donde está el mostrador ("south" | "north") */
function stall(v, P, x0, z0, kind, front) {
  const x1 = x0 + 4, z1 = z0 + 2, yTop = G + 4;
  const zf = front === "south" ? z1 : z0, zb = front === "south" ? z0 : z1, out = front === "south" ? 1 : -1;
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) v.fill(cx, G + 1, cz, cx, G + 3, cz, fence("spruce"));
  for (let x = x0 - 1; x <= x1 + 1; x++) for (let z = z0 - 1; z <= z1 + 1; z++) v.set(x, yTop, z, b(`${(x - x0) % 2 === 0 ? P.color : "white"}_wool`));
  for (let x = x0 - 1; x <= x1 + 1; x++) v.set(x, yTop - 1, zf + out, carpet((x - x0) % 2 === 0 ? P.color : "white"));
  for (let x = x0 + 1; x < x1; x++) v.set(x, G + 1, zf, b("spruce_slab", { type: "top", waterlogged: "false" }));
  v.set(x0, G + 1, zf, barrel("up")); v.set(x1, G + 1, zf, barrel("up"));
  const row = (blks) => blks.forEach((blk, i) => v.set(x0 + 1 + i, G + 2, zf, blk));
  const bk = (i, blk, y = G + 1) => v.set(x0 + 1 + i, y, zb, blk);
  if (kind === "food") { row([b("pumpkin"), b("melon"), hay()]); bk(0, barrel("up")); bk(1, barrel("up")); bk(2, b("composter", { level: "4" })); }
  if (kind === "arms") { row([b(`${P.color}_banner`, { rotation: "8" }), b("blast_furnace", { facing: front, lit: "false" }), anvil("east")]); bk(0, chest(front)); bk(2, b("grindstone", { face: "floor", facing: front })); }
  if (kind === "herbs") { row([flowerPot("red_tulip"), flowerPot("cornflower"), flowerPot("oxeye_daisy")]); bk(0, b("brewing_stand", { has_bottle_0: "false", has_bottle_1: "false", has_bottle_2: "false" })); bk(1, b("water_cauldron", { level: "3" })); bk(2, lectern(front)); }
  if (kind === "wool") { row([b("white_wool"), b(`${P.color}_wool`), b("black_wool")]); bk(0, b("loom", { facing: front })); bk(1, barrel("up")); bk(2, b("cartography_table")); }
  if (kind === "books") { row([lectern(front), candle(2), lectern(front)]); for (let i = 0; i < 3; i++) { bk(i, bookshelf()); bk(i, bookshelf(), G + 2); } }
  v.set(x0 + 2, yTop - 1, z0 + 1, hangLantern());
}

function well(v, cx, cz, P) {
  for (let x = cx - 1; x <= cx + 1; x++) for (let z = cz - 1; z <= cz + 1; z++) { v.set(x, G, z, b("stone_bricks")); v.set(x, G + 1, z, slabBlk("stone_brick")); }
  v.set(cx, G + 1, cz, null); v.set(cx, G, cz, water()); v.set(cx, G - 1, cz, b("stone_bricks"));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { v.fill(cx + sx, G + 2, cz + sz, cx + sx, G + 3, cz + sz, fence("dark_oak")); v.set(cx + sx, G + 1, cz + sz, b("stone_bricks")); }
  const roofSt = (f) => (P.roof === "brick" ? b("brick_stairs", { facing: f, half: "bottom", shape: "straight", waterlogged: "false" }) : stairBlk(P.roof, f));
  for (let x = cx - 2; x <= cx + 2; x++) for (let z = cz - 2; z <= cz + 2; z++) {
    const ex = Math.abs(x - cx) === 2, ez = Math.abs(z - cz) === 2;
    if (ex && ez) continue;
    if (ex || ez) v.set(x, G + 4, z, roofSt(ex ? (x < cx ? "east" : "west") : (z < cz ? "south" : "north")));
    else v.set(x, G + 4, z, b(P.roof === "brick" ? "bricks" : `${P.roof}_planks`));
  }
  v.set(cx, G + 5, cz, b(P.roof === "brick" ? "brick_slab" : `${P.roof}_slab`, { type: "bottom", waterlogged: "false" }));
  v.set(cx, G + 3, cz, chain()); v.set(cx, G + 2, cz, chain()); v.set(cx, G + 1, cz, hangLantern());
}

function lamp(v, x, z) { if (v.get(x, G + 1, z)) return; v.fill(x, G + 1, z, x, G + 4, z, fence("dark_oak")); v.set(x, G + 5, z, lantern(false)); }
function bannerPole(v, x, z, P) {
  v.fill(x, G + 1, z, x, G + 6, z, log("dark_oak"));
  for (const f of ["north", "south", "east", "west"]) { const [dx, dz] = DIRS[f]; v.set(x + dx, G + 4, z + dz, wallBanner(P.color, f)); }
  v.set(x, G + 7, z, lantern(false));
}

function tree(v, x, z, r, kind = "oak") {
  const h = 4 + Math.floor(r() * 2);
  v.fill(x, G + 1, z, x, G + h, z, log(kind));
  for (let y = G + h - 2; y <= G + h + 1; y++) { const rad = y >= G + h ? 1 : 2; for (let dx = -rad; dx <= rad; dx++) for (let dz = -rad; dz <= rad; dz++) { if (Math.abs(dx) === rad && Math.abs(dz) === rad && (y >= G + h || r() < 0.5)) continue; if (!v.get(x + dx, y, z + dz)) v.set(x + dx, y, z + dz, leaves(kind)); } }
}

function farm(v, x0, z0, w, d) {
  const x1 = x0 + w - 1, z1 = z0 + d - 1, mid = Math.floor((z0 + z1) / 2);
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    if (x === x0 || x === x1 || z === z0 || z === z1) { v.set(x, G + 1, z, fence("oak")); continue; }
    if (z === mid) { v.set(x, G, z, water()); v.set(x, G - 1, z, b("dirt")); continue; }
    v.set(x, G, z, farmland()); v.set(x, G + 1, z, crop(["wheat", "carrots", "potatoes"][(z < mid ? z - z0 : z - mid) % 3], 7));
  }
  v.set(Math.floor((x0 + x1) / 2), G + 1, z0, b("oak_fence_gate", { facing: "north", open: "false", powered: "false", in_wall: "false" }));
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) v.set(x, G + 2, z, lantern(false));
  v.set(x0 + 1, G, z1 - 1, b("coarse_dirt")); v.set(x0 + 1, G + 1, z1 - 1, fence("oak")); v.set(x0 + 1, G + 2, z1 - 1, b("carved_pumpkin", { facing: "south" }));
}

/** corral: valla, fardos y abrevaderos */
function pen(v, x0, z0, w, d, r) {
  const x1 = x0 + w - 1, z1 = z0 + d - 1;
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (x === x0 || x === x1 || z === z0 || z === z1) v.set(x, G + 1, z, fence("oak"));
  v.set(Math.floor((x0 + x1) / 2), G + 1, z0, b("oak_fence_gate", { facing: "north", open: "false", powered: "false", in_wall: "false" }));
  for (let k = 0; k < 6; k++) v.set(x0 + 2 + Math.floor(r() * (w - 4)), G + 1, z0 + 2 + Math.floor(r() * (d - 4)), hay());
  for (let x = x1 - 5; x <= x1 - 2; x++) v.set(x, G + 1, z1 - 1, b("water_cauldron", { level: "3" }));
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { v.fill(x, G + 1, z, x, G + 2, z, fence("oak")); v.set(x, G + 3, z, lantern(false)); }
}

/** campo de entrenamiento: arena con valla, dianas de heno y estandartes */
function arena(v, P, x0, z0, w, d) {
  const x1 = x0 + w - 1, z1 = z0 + d - 1, mx = Math.floor((x0 + x1) / 2);
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    const edge = x === x0 || x === x1 || z === z0 || z === z1;
    v.set(x, G, z, b(edge ? "coarse_dirt" : "sand"));
    if (edge) v.set(x, G + 1, z, fence("spruce"));
  }
  for (let x = mx - 1; x <= mx + 1; x++) v.set(x, G + 1, z0, null);
  for (let i = 0; i < 3; i++) { const x = x0 + 4 + i * Math.floor((w - 8) / 2), z = z1 - 2; v.set(x, G + 1, z, hay()); v.set(x, G + 2, z, hay()); v.set(x, G + 3, z, b(`${P.color}_banner`, { rotation: "0" })); }
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { v.fill(x, G + 1, z, x, G + 4, z, log("spruce")); v.set(x, G + 5, z, lantern(false)); }
  v.set(x0 + 2, G + 1, z0 + 2, b("grindstone", { face: "floor", facing: "south" })); v.set(x1 - 2, G + 1, z0 + 2, barrel("up")); v.set(x1 - 2, G + 2, z0 + 2, lantern(false));
}

function tower(v, P, cx, cz, r, inner) {
  const x0 = cx - 2, x1 = cx + 2, z0 = cz - 2, z1 = cz + 2, top = G + 9;
  v.fill(x0, G, z0, x1, G, z1, b("cobblestone"));
  for (let y = G + 1; y <= top; y++) for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (x === x0 || x === x1 || z === z0 || z === z1) v.set(x, y, z, b(pick(r, ["stone_bricks", "stone_bricks", "stone_bricks", "mossy_stone_bricks", "cracked_stone_bricks"])));
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) v.fill(x, G + 1, z, x, top, z, b("stone_bricks"));
  v.fill(x0 + 1, G, z0 + 1, x1 - 1, G, z1 - 1, b("spruce_planks"));
  for (const y of [G + 5, top]) for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (x === x0 || x === x1 || z === z0 || z === z1) v.set(x, y, z, log("dark_oak", (z === z0 || z === z1) ? "x" : "z"));
  v.fill(x0 + 1, G + 5, z0 + 1, x1 - 1, G + 5, z1 - 1, b("spruce_planks"));
  const lx = inner > 0 ? x0 + 1 : x1 - 1, lf = inner > 0 ? "east" : "west";
  v.set(lx, G + 5, cz, null);
  for (let y = G + 1; y <= G + 6; y++) v.set(lx, y, cz, b("ladder", { facing: lf, waterlogged: "false" }));
  const dx = inner > 0 ? x1 : x0, dfac = inner > 0 ? "east" : "west";
  v.set(dx, G + 1, cz, null); v.set(dx, G + 2, cz, null); placeDoor(v, "spruce", dx, G + 1, cz, dfac);
  const slit = () => b("iron_bars", { north: "false", south: "false", east: "false", west: "false", waterlogged: "false" });
  for (const y of [G + 3, G + 7]) { v.set(cx, y, z0, slit()); v.set(cx, y, z1, slit()); v.set(inner > 0 ? x0 : x1, y, cz + 1, slit()); }
  v.set(cx + 1, G + 1, cz + 1, barrel("up")); v.set(cx + 1, G + 2, cz + 1, lantern(false));
  v.set(cx + 1, G + 6, cz + 1, barrel("up")); v.set(cx + 1, G + 7, cz + 1, lantern(false));
  const st = (f) => (P.roof === "brick" ? b("brick_stairs", { facing: f, half: "bottom", shape: "straight", waterlogged: "false" }) : stairBlk(P.roof, f));
  const full = b(P.roof === "brick" ? "bricks" : `${P.roof}_planks`);
  for (let k = 0; k < 4; k++) {
    const rad = 3 - k, y = top + 1 + k;
    for (let x = cx - rad; x <= cx + rad; x++) for (let z = cz - rad; z <= cz + rad; z++) {
      const ex = Math.abs(x - cx) === rad, ez = Math.abs(z - cz) === rad;
      if (!ex && !ez) continue;
      if (rad === 0) { v.set(x, y, z, b(P.roof === "brick" ? "brick_slab" : `${P.roof}_slab`, { type: "bottom", waterlogged: "false" })); continue; }
      if (ex && ez) v.set(x, y, z, full);
      else if (ex) v.set(x, y, z, st(x < cx ? "east" : "west"));
      else v.set(x, y, z, st(z < cz ? "south" : "north"));
    }
  }
  v.set(cx, top + 6, cz, fence("dark_oak")); v.set(cx, top + 7, cz, b(`${P.color}_banner`, { rotation: "0" }));
}

function wallRing(v, P, r) {
  const lo = 2, hi = N - 3;
  for (let i = lo; i <= hi; i++) for (const [x, z] of [[i, lo], [i, hi], [lo, i], [hi, i]]) {
    for (let y = G + 1; y <= G + 5; y++) v.set(x, y, z, b(pick(r, ["stone_bricks", "stone_bricks", "stone_bricks", "stone_bricks", "mossy_stone_bricks", "cracked_stone_bricks"])));
    v.set(x, G, z, b("cobblestone"));
    if (i % 2 === 0) v.set(x, G + 6, z, b("stone_bricks"));
  }
  const gate = (side) => {
    const cells = []; for (let t = C - 2; t <= C + 2; t++) cells.push(side === "south" ? [t, hi] : side === "east" ? [hi, t] : [lo, t]);
    for (const [x, z] of cells) { v.clear(x, G + 1, z, x, G + 4, z); v.set(x, G + 6, z, null); v.set(x, G, z, b("dirt_path")); v.set(x, G + 5, z, log("dark_oak", side === "south" ? "x" : "z")); }
    const pill = side === "south" ? [[C - 3, hi], [C + 3, hi]] : side === "east" ? [[hi, C - 3], [hi, C + 3]] : [[lo, C - 3], [lo, C + 3]];
    for (const [x, z] of pill) v.fill(x, G + 1, z, x, G + 6, z, log("dark_oak"));
    const [ox, oz] = DIRS[side];
    for (const [x, z] of pill) v.set(x + ox, G + 4, z + oz, wallBanner(P.color, side));
    const [cx, cz] = cells[2]; v.set(cx, G + 4, cz, hangLantern());
  };
  for (const s of ["south", "east", "west"]) gate(s);
}

/** Gran Salón del gremio: nave alta con tarima, chimeneas, mesas largas, galerías con estantes y pórtico de entrada */
function hallBuilding(v, P) {
  const x0 = 34, z0 = 8, w = 29, d = 21, x1 = x0 + w - 1, z1 = z0 + d - 1, cx = x0 + (w - 1) / 2;
  const H = house(v, P, x0, z0, w, d, { door: "south", h: 8, chimney: false, winY: [2, 6] });
  const top = H.top;
  house(v, P, cx - 5, z1 + 1, 11, 6, { door: "south", ridge: "z", h: 5, chimney: false, winY: [2] });    // pórtico
  for (let x = cx - 1; x <= cx + 1; x++) for (const z of [z1, z1 + 1]) { v.clear(x, G + 1, z, x, G + 4, z); v.set(x, G + 4, z, log(P.beam, "x")); }
  for (const x of [cx - 2, cx + 2]) v.set(x, G + 3, z1 + 2, b("wall_torch", { facing: "south" }));
  for (const x of [cx - 3, cx + 3]) { v.set(x, G + 1, z1 + 2, barrel("up")); v.set(x, G + 2, z1 + 2, lantern(false)); }
  // pilares, vigas del techo abierto y arañas de luces
  const rows = [12, 16, 20, 24];
  for (const z of rows) for (let x = x0 + 1; x < x1; x++) v.set(x, top, z, log(P.beam, "x"));
  for (const x of [x0 + 7, x1 - 7]) for (const z of rows) { v.fill(x, G + 1, z, x, top - 1, z, log(P.beam)); v.set(x, G + 5, z, b(`${P.color}_wool`)); }
  for (const z of rows) for (const x of [cx, cx - 5, cx + 5]) { v.set(x, top - 1, z, chain()); v.set(x, top - 2, z, chain()); v.set(x, top - 3, z, hangLantern()); }
  // tarima del fondo con el NPC
  v.fill(cx - 8, G + 1, z0 + 1, cx + 8, G + 1, z0 + 5, b("stone_bricks"));
  for (let x = cx - 8; x <= cx + 8; x++) v.set(x, G + 1, z0 + 6, stairBlk("stone_brick", "north"));
  v.fill(cx - 4, G + 2, z0 + 1, cx + 4, G + 2, z0 + 3, b("polished_andesite"));
  for (let x = cx - 4; x <= cx + 4; x++) v.set(x, G + 2, z0 + 4, stairBlk("polished_andesite", "north"));
  for (let x = cx - 3; x <= cx + 3; x++) for (let z = z0 + 1; z <= z0 + 3; z++) v.set(x, G + 3, z, carpet(P.color));
  v.set(cx - 4, G + 3, z0 + 1, lectern("south")); v.set(cx + 4, G + 3, z0 + 1, lectern("south"));
  for (const dx of [-6, -3, 0, 3, 6]) { v.set(cx + dx, G + 5, z0 + 1, wallBanner(P.color, "south")); v.set(cx + dx, G + 4, z0 + 1, wallBanner(P.color, "south")); }
  for (const dx of [-7, 7]) { v.set(cx + dx, G + 2, z0 + 2, barrel("up")); v.set(cx + dx, G + 3, z0 + 2, lantern(false)); }
  // alfombra de entrada y mesas largas con bancos
  for (let z = z0 + 7; z <= z1 - 1; z++) { for (let dx = -1; dx <= 1; dx++) v.set(cx + dx, G + 1, z, carpet(P.color)); for (const dx of [-2, 2]) v.set(cx + dx, G + 1, z, carpet("white")); }
  for (const tx of [cx - 5, cx + 5]) for (let z = z0 + 9; z <= z1 - 3; z++) {
    v.set(tx, G + 1, z, b("spruce_slab", { type: "top", waterlogged: "false" }));
    if ((z - z0) % 3 === 0) v.set(tx, G + 2, z, candle(2));
    v.set(tx - 1, G + 1, z, stairBlk("spruce", "west")); v.set(tx + 1, G + 1, z, stairBlk("spruce", "east"));
  }
  // chimeneas a ambos lados (suben atravesando el tejado)
  for (const [fx, face, ox] of [[x0 + 1, "east", 1], [x1 - 1, "west", -1]]) {
    const fz = z0 + 8, inv = face === "east" ? "west" : "east";
    v.fill(fx, G + 1, fz - 1, fx, G + 4, fz + 1, b("stone_bricks"));
    v.fill(fx, G + 5, fz, fx, top + 12, fz, b("stone_bricks"));
    v.set(fx + ox, G + 1, fz, furnace("furnace", face)); v.set(fx + ox, G + 2, fz, b("stone_bricks"));
    for (const dz of [-1, 1]) v.set(fx + ox, G + 1, fz + dz, stairBlk("stone_brick", inv));
    v.set(fx + ox * 2, G + 1, fz, b("campfire", { facing: face, lit: "false", signal_fire: "false", waterlogged: "false" }));
  }
  // galerías laterales con escalera, barandilla, estantes y escritorio
  for (const side of [-1, 1]) {
    const wx = side < 0 ? x0 + 1 : x1 - 1, gx = side < 0 ? [x0 + 1, x0 + 3] : [x1 - 3, x1 - 1], rail = side < 0 ? x0 + 4 : x1 - 4, sx = side < 0 ? x0 + 2 : x1 - 2, inw = side < 0 ? 1 : -1;
    const zA = z0 + 11, zB = z1 - 5;
    for (let x = gx[0]; x <= gx[1]; x++) for (let z = zA; z <= zB; z++) v.set(x, G + 4, z, b(`${P.floor}_planks`));
    for (let z = zA; z <= zB; z++) v.set(rail, G + 5, z, fence(P.trim));
    for (let k = 0; k < 4; k++) v.set(sx, G + 1 + k, zB + 3 - k, stairBlk(P.floor, "north"));
    for (let z = zA + 1; z <= zB; z += 2) { v.set(wx, G + 5, z, bookshelf()); v.set(wx, G + 6, z, bookshelf()); }
    v.set(wx + inw * 2, G + 5, zA + 2, barrel("up")); v.set(wx + inw * 2, G + 6, zA + 2, lantern(false));
    v.set(wx + inw * 2, G + 5, zB - 1, b("chest", { facing: side < 0 ? "east" : "west", type: "single", waterlogged: "false" }));
    v.set(wx + inw * 2, G + 5, zB - 2, b("crafting_table"));
  }
  for (const dx of [-17, -13, 13, 17]) v.set(cx + dx, G + 4, z1 + 1, wallBanner(P.color, "south"));
  H.npcSpot = [cx, G + 3, z0 + 2];
  return H;
}

function tavernInterior(v, P, t) {
  const { x0, z0, x1, z1 } = t, yf = G + 5, xm = (x0 + x1) >> 1;
  for (let x = x0 + 7; x <= x1 - 2; x++) { v.set(x, G + 1, z0 + 2, b("spruce_slab", { type: "top", waterlogged: "false" })); v.set(x, G + 1, z0 + 1, barrel("up")); }
  v.set(x0 + 8, G + 2, z0 + 2, candle(1)); v.set(x0 + 10, G + 2, z0 + 1, lantern(false));
  for (let x = x0 + 12; x <= x1 - 3; x += 2) v.set(x, G + 2, z0 + 1, barrel("up"));
  for (const [mx, mz] of [[x0 + 7, z0 + 6], [x0 + 10, z0 + 6], [x0 + 13, z0 + 6], [x0 + 7, z1 - 2], [x0 + 11, z1 - 2]]) {
    table(v, mx, mz, P); v.set(mx, G + 2, mz, candle(3));
    v.set(mx - 1, G + 1, mz, stairBlk(P.trim, "west")); v.set(mx + 1, G + 1, mz, stairBlk(P.trim, "east"));
  }
  v.set(x1 - 1, G + 1, z1 - 3, b("campfire", { facing: "west", lit: "false", signal_fire: "false", waterlogged: "false" }));
  for (let x = x0 + 6; x <= x0 + 14; x++) for (let z = z0 + 5; z <= z0 + 7; z++) if (!v.get(x, G + 1, z)) v.set(x, G + 1, z, carpet(P.color));
  for (const x of [x0 + 8, x0 + 13]) { v.set(x, G + 4, z0 + 5, hangLantern()); v.set(x, G + 4, z1 - 3, hangLantern()); }
  // planta alta: camas (la cabecera junto a la pared), cofres y luz
  for (let k = 0; k < 4; k++) { const bx = x0 + 7 + k * 2, c = k % 2 ? "white" : P.color; v.set(bx, yf + 1, z0 + 1, bed(c, "north", "head")); v.set(bx, yf + 1, z0 + 2, bed(c, "north", "foot")); }
  for (let k = 0; k < 3; k++) { const cx = x0 + 8 + k * 2; v.set(cx, yf + 1, z0 + 1, k === 1 ? b("chest", { facing: "south", type: "single", waterlogged: "false" }) : barrel("up")); if (k !== 1) v.set(cx, yf + 2, z0 + 1, lantern(false)); }
  for (let k = 0; k < 3; k++) { const bx = x0 + 7 + k * 2, c = k % 2 ? P.color : "white"; v.set(bx, yf + 1, z1 - 1, bed(c, "south", "head")); v.set(bx, yf + 1, z1 - 2, bed(c, "south", "foot")); }
  v.set(x1 - 2, yf + 1, z1 - 1, bookshelf()); v.set(x1 - 2, yf + 2, z1 - 1, bookshelf());
  v.set(x1 - 4, yf + 1, z1 - 1, barrel("up")); v.set(x1 - 4, yf + 2, z1 - 1, lantern(false));
  table(v, xm + 2, z0 + 5, P, yf + 1); v.set(xm + 2, yf + 3, z0 + 5, lantern(false));
}

let v;
function buildVillage(id) {
  const P = PALETTES[id], seed = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7), r = rng(seed);
  v = new Voxels(N, SY, N);
  v.fill(0, 0, 0, N - 1, G - 1, N - 1, b("dirt"));
  for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) v.set(x, G, z, b(r() < 0.04 ? "coarse_dirt" : "grass_block", { snowy: "false" }));
  // caminos (tierra con bordes de grava), plaza, explanada ante el salón y callejón del mercado
  const path = (x, z) => v.set(x, G, z, b(r() < 0.2 ? "gravel" : "dirt_path"));
  for (let t = 3; t <= N - 4; t++) for (let k = C - 2; k <= C + 2; k++) { path(t, k); if (t >= 33) path(k, t); }
  for (let x = 36; x <= 60; x++) for (let z = 36; z <= 60; z++) {
    const dist = Math.hypot(x - C, z - C);
    let blk = "cobblestone";
    if (dist <= 11.5) blk = dist <= 3.5 || dist >= 10 ? "stone_bricks" : r() < 0.5 ? "polished_andesite" : "andesite";
    v.set(x, G, z, b(blk));
  }
  for (let t = 36; t <= 60; t++) for (const [x, z] of [[t, 36], [t, 60], [36, t], [60, t]]) v.set(x, G, z, b("stone_bricks"));
  for (let x = 36; x <= 60; x++) for (let z = 30; z <= 35; z++) v.set(x, G, z, b(r() < 0.3 ? "cobblestone" : "stone_bricks"));
  for (let x = 54; x <= 90; x++) for (let z = 55; z <= 61; z++) v.set(x, G, z, b(r() < 0.35 ? "gravel" : "coarse_dirt"));
  for (let x = 63; x <= 89; x++) for (let z = 66; z <= 74; z++) if (r() < 0.4) v.set(x, G, z, b("gravel"));

  wallRing(v, P, r);
  const TOWERS = [[4, 4, 1], [N - 5, 4, -1], [4, N - 5, 1], [N - 5, N - 5, -1], [24, 4, 1], [72, 4, -1], [4, 24, 1], [N - 5, 24, -1], [4, 72, 1], [N - 5, 72, -1], [24, N - 5, 1], [72, N - 5, -1]];
  for (const [cx, cz, inner] of TOWERS) tower(v, P, cx, cz, r, inner);

  const hall = hallBuilding(v, P);
  const tavern = house(v, P, 64, 36, 16, 10, { door: "south", floors: 2, sign: ["Taberna"] });
  forge(v, P, 9, 36, 12, 8);
  const homes = [
    house(v, P, 8, 8, 11, 9, { door: "south" }), house(v, P, 22, 8, 10, 9, { door: "south", floors: 2 }),
    house(v, P, 8, 22, 10, 9, { door: "south", floors: 2 }), house(v, P, 21, 22, 11, 8, { door: "south" }),
    house(v, P, 66, 8, 10, 9, { door: "south" }), house(v, P, 79, 8, 9, 9, { door: "south", floors: 2 }),
    house(v, P, 66, 22, 10, 9, { door: "south", floors: 2 }), house(v, P, 79, 22, 9, 8, { door: "south" }),
    house(v, P, 8, 52, 10, 8, { door: "north", sign: ["Hogar"] }), house(v, P, 22, 52, 10, 8, { door: "north" }),
    house(v, P, 34, 52, 9, 8, { door: "north", floors: 2 }), house(v, P, 52, 68, 11, 9, { door: "west", sign: ["Cuartel"] }),
  ];
  homes.forEach((h, i) => {
    furnish(v, P, h, G, { beds: i % 2 ? [0, 3] : [0], crafting: true, table: true, extraShelf: i % 3 === 0 }, r);
    if (h.top - G > 5) furnish(v, P, h, G + 5, { beds: [0, 2, 4], crafting: false, table: false, extraShelf: true }, r);
    yardDecor(v, P, h, r);
  });
  yardDecor(v, P, tavern, r);
  tavernInterior(v, P, tavern);

  const kinds = ["food", "arms", "herbs", "wool", "books", "food"];
  kinds.forEach((k, i) => { stall(v, P, 54 + i * 6, 52, k, "south"); stall(v, P, 54 + i * 6, 62, kinds[(i + 2) % 6], "north"); });
  arena(v, P, 64, 76, 25, 13);
  farm(v, 8, 64, 13, 13); farm(v, 24, 64, 14, 13); pen(v, 8, 80, 24, 9, r);

  well(v, C, C, P);
  for (const [x, z] of [[40, 40], [56, 40], [40, 56], [56, 56]]) bannerPole(v, x, z, P);
  for (let x = 6; x <= N - 7; x += 8) { lamp(v, x, C - 3); lamp(v, x, C + 3); }
  for (let z = 56; z <= N - 8; z += 8) { lamp(v, C - 3, z); lamp(v, C + 3, z); }
  for (const [x, z] of [[38, 38], [58, 38], [38, 58], [58, 58], [44, 34], [52, 34], [38, 33], [58, 33]]) lamp(v, x, z);
  let placed = 0;
  for (let tries = 0; tries < 900 && placed < 24; tries++) {
    const x = 6 + Math.floor(r() * (N - 12)), z = 6 + Math.floor(r() * (N - 12));
    let ok = true;
    for (let dx = -3; dx <= 3 && ok; dx++) for (let dz = -3; dz <= 3 && ok; dz++) { const g = v.get(x + dx, G, z + dz); if (!g || g.n !== "minecraft:grass_block" || v.get(x + dx, G + 1, z + dz)) ok = false; }
    if (ok) { tree(v, x, z, r, pick(r, ["oak", "oak", "birch"])); placed++; }
  }
  const info = { id, size: [N, SY, N], surface: G, spawn: [C, G + 1, 55], npc: hall.npcSpot, plaza: [C, G, C] };
  return { nbt: v.toNbt(), info };
}

const targets = process.argv[2] && process.argv[2] !== "all" ? [process.argv[2]] : Object.keys(PALETTES);
const outDir = process.argv[3] || "kubejs/data/pony0n/structures";
mkdirSync(outDir, { recursive: true }); mkdirSync("tools/village/out", { recursive: true });
for (const id of targets) {
  const { nbt, info } = buildVillage(id);
  writeFileSync(`${outDir}/pueblo_${id}.nbt`, nbt);
  writeFileSync(`tools/village/out/pueblo_${id}.json`, JSON.stringify(info, null, 2));
  console.log(`pueblo_${id}.nbt  ${nbt.length} bytes  npc=${info.npc}`);
}
