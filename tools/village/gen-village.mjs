// Generador del pueblo inicial de gremio. Uso: node tools/village/gen-village.mjs [gremio|all] [salidaDir]
// Produce <salidaDir>/pueblo_<gremio>.nbt (estructura de Minecraft) y pueblo_<gremio>.json (posiciones de NPC, spawn y tamaño).
// Plantilla de 65 x 26 x 65: y=0..2 cimentación de tierra, y=3 suelo (SURF), el pueblo sube desde y=4.
import { writeFileSync, mkdirSync } from "node:fs";
import { Voxels, b, stairs, slab, log, fence, lantern, chest, barrel, furnace, wallTorch, bed, wallBanner, carpet, bookshelf, hay, glassPane, crop, farmland,
  anvil, grindstone, flowerPot, leaves, water, OPP, DIRS } from "./voxel.mjs";
import { house, gableRoof, placeDoor, PALETTES, SURF } from "./buildings.mjs";

const G = SURF, N = 65;
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const VEC_TO_FACING = (dx, dz) => (dx > 0 ? "east" : dx < 0 ? "west" : dz > 0 ? "south" : "north");

/** mapa local de una casa: u = a lo largo de la pared de la puerta, dv = hacia dentro (0 = fila pegada a la pared de la puerta) */
function localMap(h) {
  const { x0, z0, x1, z1, doorDir: d } = h;
  const inward = DIRS[OPP[d]];                       // hacia dentro de la casa
  const uvec = d === "south" || d === "north" ? [1, 0] : [0, 1];
  const wallLen = d === "south" || d === "north" ? x1 - x0 + 1 : z1 - z0 + 1;
  const depth = d === "south" || d === "north" ? z1 - z0 + 1 : x1 - x0 + 1;
  const base = { south: [x0, z1], north: [x0, z0], east: [x1, z0], west: [x0, z0] }[d];
  return {
    U: wallLen - 2, D: depth - 2,                    // tamaño interior
    at: (u, dv) => [base[0] + uvec[0] * (u + 1) + inward[0] * (dv + 1), base[1] + uvec[1] * (u + 1) + inward[1] * (dv + 1)],
    face: { in: VEC_TO_FACING(...inward), out: d, right: VEC_TO_FACING(...uvec), left: VEC_TO_FACING(-uvec[0], -uvec[1]) },
    uvec, inward,
  };
}

const table = (v, x, z, P, plate = true) => { v.set(x, G + 1, z, fence(P.trim)); if (plate) v.set(x, G + 2, z, b(`${P.trim}_pressure_plate`, { powered: "false" })); };
const chair = (v, x, z, P, facing) => v.set(x, G + 1, z, stairs(P.trim, facing));   // facing = hacia donde mira el respaldo (lejos de la mesa)

function furnishHome(v, P, h, variant, r) {
  const m = localMap(h), put = (u, dv, blk, y = G + 1) => { const [x, z] = m.at(u, dv); v.set(x, y, z, blk); };
  const backDv = m.D - 1;
  // camas en la pared del fondo
  const beds = variant === "family" ? [0, 3] : [0];
  for (const u of beds) { const [hx, hz] = m.at(u, backDv), [fx, fz] = m.at(u, backDv - 1); v.set(hx, G + 1, hz, bed(P.color, m.face.in, "head")); v.set(fx, G + 1, fz, bed(P.color, m.face.in, "foot")); }
  put(m.U - 1, backDv, b("chest", { facing: m.face.out, type: "single", waterlogged: "false" }));
  put(m.U - 2, backDv, bookshelf()); put(m.U - 2, backDv, bookshelf(), G + 2); put(m.U - 1, backDv, bookshelf(), G + 2);
  put(m.U - 1, 1, b("crafting_table"));
  put(m.U - 1, 2, barrel("up"));
  if (variant === "family") { put(0, 2, bookshelf()); put(0, 2, flowerPot(pick(r, ["poppy", "dandelion", "blue_orchid"])), G + 2); }
  // mesa con sillas
  const tu = Math.floor(m.U / 2), tdv = Math.min(2, m.D - 3);
  const [tx, tz] = m.at(tu, tdv); table(v, tx, tz, P);
  const [cx, cz] = m.at(tu - 1, tdv); chair(v, cx, cz, P, m.face.left);
  const [dx, dz] = m.at(tu + 1, tdv); chair(v, dx, dz, P, m.face.right);
  // alfombra
  for (let u = tu - 1; u <= tu + 1; u++) for (let dv = tdv - 1; dv <= tdv + 1; dv++) { const [x, z] = m.at(u, dv); if (!v.get(x, G + 1, z)) v.set(x, G + 1, z, carpet(r() < 0.5 ? P.color : "white")); }
  // lámpara sobre la mesa
  v.set(tx, G + 2, tz, lantern(false));
  v.set(tx, G + 2, tz, b(`${P.trim}_pressure_plate`, { powered: "false" })); v.set(tx, G + 3, tz, lantern(false));
}

function yardDecor(v, P, h, r) {
  const [dx, dz] = DIRS[h.doorDir];
  const along = h.doorDir === "south" || h.doorDir === "north" ? [1, 0] : [0, 1];
  const bx = h.door[0] + dx * 2, bz = h.door[1] + dz * 2;
  for (const s of [-2, 2]) {
    const X = bx + along[0] * s, Z = bz + along[1] * s;
    v.set(X, G + 1, Z, r() < 0.5 ? barrel("up") : b("hay_block", { axis: "y" }));
    v.set(X + dx, G + 1, Z + dz, pick(r, [b("poppy"), b("dandelion"), b("cornflower"), b("azure_bluet"), b("allium")]));
  }
  // camino de entrada
  for (let k = 1; k <= 3; k++) v.set(h.door[0] + dx * k, G, h.door[1] + dz * k, b("dirt_path"));
}

/** cobertizo de herrería: fondo y laterales de piedra, frente abierto, yunque/hornos/amoladora/caldero */
function forge(v, P, x0, z0, w, d, r) {
  const x1 = x0 + w - 1, z1 = z0 + d - 1, top = G + 4;
  v.fill(x0, G, z0, x1, G, z1, b("stone_bricks")); v.fill(x0 + 1, G, z0 + 1, x1 - 1, G, z1 - 1, b("cobblestone"));
  v.walls(x0, G + 1, z0, x1, top, z1, b("cobblestone"));
  v.clear(x0 + 1, G + 1, z1, x1 - 1, top, z1);                       // frente abierto
  v.walls(x0, G + 1, z0, x1, G + 1, z1, b("stone_bricks")); v.clear(x0 + 1, G + 1, z1, x1 - 1, G + 1, z1);
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) v.fill(cx, G + 1, cz, cx, top, cz, log(P.beam));
  for (let x = x0 + 1; x < x1; x++) { v.set(x, top, z0, log(P.beam, "x")); v.set(x, top, z1, log(P.beam, "x")); }
  for (let z = z0 + 1; z < z1; z++) { v.set(x0, top, z, log(P.beam, "z")); v.set(x1, top, z, log(P.beam, "z")); }
  // postes del frente
  for (const x of [x0 + Math.floor(w / 3), x1 - Math.floor(w / 3)]) { v.fill(x, G + 1, z1, x, top - 1, z1, log(P.beam)); }
  const hts = gableRoof(v, P, x0, z0, x1, z1, top + 1, "x");
  for (const e of [x0, x1]) for (const { pos, y } of hts) { if (pos >= z0 && pos <= z1) for (let yy = top + 1; yy < y; yy++) v.set(e, yy, pos, b("cobblestone")); }
  // equipo contra la pared trasera
  const bz = z0 + 1;
  v.set(x0 + 1, G + 1, bz, furnace("furnace", "south")); v.set(x0 + 2, G + 1, bz, furnace("blast_furnace", "south")); v.set(x0 + 3, G + 1, bz, b("smithing_table"));
  v.set(x1 - 1, G + 1, bz, b("chest", { facing: "south", type: "single", waterlogged: "false" })); v.set(x1 - 2, G + 1, bz, barrel("up"));
  v.set(x0 + 1, G + 1, z0 + 3, b("water_cauldron", { level: "3" }));
  const mx = Math.floor((x0 + x1) / 2);
  v.set(mx, G + 1, z0 + 3, anvil("east")); v.set(mx + 2, G + 1, z0 + 4, grindstone("north"));
  v.set(x1 - 1, G + 1, z0 + 4, b("lava_cauldron"));
  // chimenea
  const cx = x0 + 2, cz = z0;
  v.fill(cx, G + 2, cz, cx, top + 5, cz, b("stone_bricks")); v.set(cx, top + 6, cz, b("stone_brick_slab", { type: "bottom", waterlogged: "false" }));
  v.set(cx, G + 2, cz + 1, b("campfire", { facing: "south", lit: "false", signal_fire: "false", waterlogged: "false" }));
  v.set(mx, top - 1, z1, b("lantern", { hanging: "true", waterlogged: "false" }));
  v.set(mx - 3, top - 1, z0 + 1, b("lantern", { hanging: "true", waterlogged: "false" }));
  v.set(mx, top, z0 + 1, log(P.beam, "x")); v.set(mx - 3, top, z0 + 1, log(P.beam, "x"));
  return { x0, z0, x1, z1 };
}

function stall(v, P, x0, z0, kind, r) {
  const w = 5, d = 3, x1 = x0 + w - 1, z1 = z0 + d - 1, yTop = G + 4;
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) v.fill(cx, G + 1, cz, cx, G + 3, cz, fence("spruce"));
  for (let x = x0 - 1; x <= x1 + 1; x++) for (let z = z0 - 1; z <= z1 + 1; z++) v.set(x, yTop, z, b(`${(x - x0) % 2 === 0 ? P.color : "white"}_wool`));
  for (let x = x0 - 1; x <= x1 + 1; x++) v.set(x, yTop - 1, z1 + 1, carpet((x - x0) % 2 === 0 ? P.color : "white"));   // faldón del frente
  for (let x = x0 + 1; x < x1; x++) v.set(x, G + 1, z1, b("spruce_slab", { type: "top", waterlogged: "false" }));   // mostrador
  v.set(x0, G + 1, z1, barrel("up")); v.set(x1, G + 1, z1, barrel("up"));
  const row = (blks) => blks.forEach((blk, i) => v.set(x0 + 1 + i, G + 2, z1, blk));
  const back = z0;
  if (kind === "food") { row([b("pumpkin"), b("melon"), b("hay_block", { axis: "y" })]); v.set(x0 + 1, G + 1, back, barrel("up")); v.set(x0 + 2, G + 1, back, barrel("up")); v.set(x1 - 1, G + 1, back, b("composter", { level: "4" })); v.set(x0 + 2, G + 2, back, b("melon")); }
  if (kind === "arms") { row([b(`${P.color}_banner`, { rotation: "8" }), b("blast_furnace", { facing: "south", lit: "false" }), b("anvil", { facing: "east" })]); v.set(x0 + 1, G + 1, back, chest("south")); v.set(x1 - 1, G + 1, back, b("grindstone", { face: "floor", facing: "south" })); }
  if (kind === "herbs") { row([flowerPot("red_tulip"), flowerPot("cornflower"), flowerPot("oxeye_daisy")]); v.set(x0 + 1, G + 1, back, b("brewing_stand", { has_bottle_0: "false", has_bottle_1: "false", has_bottle_2: "false" })); v.set(x0 + 2, G + 1, back, b("water_cauldron", { level: "3" })); v.set(x1 - 1, G + 1, back, b("lectern", { facing: "south", has_book: "false", powered: "false" })); }
  v.set(x0 + 2, yTop - 1, z0 + 1, b("lantern", { hanging: "true", waterlogged: "false" }));
}

function well(v, cx, cz, P) {
  for (let x = cx - 1; x <= cx + 1; x++) for (let z = cz - 1; z <= cz + 1; z++) { v.set(x, G, z, b("stone_bricks")); v.set(x, G + 1, z, slab("stone_brick")); }
  v.set(cx, G + 1, cz, null); v.set(cx, G, cz, water()); v.set(cx, G - 1, cz, b("stone_bricks"));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { v.fill(cx + sx, G + 2, cz + sz, cx + sx, G + 3, cz + sz, fence("dark_oak")); v.set(cx + sx, G + 1, cz + sz, b("stone_bricks")); }
  for (let x = cx - 2; x <= cx + 2; x++) for (let z = cz - 2; z <= cz + 2; z++) { const edge = Math.abs(x - cx) === 2 || Math.abs(z - cz) === 2; if (Math.abs(x - cx) === 2 && Math.abs(z - cz) === 2) continue;
    if (edge) { const f = Math.abs(x - cx) === 2 ? (x < cx ? "east" : "west") : (z < cz ? "south" : "north"); v.set(x, G + 4, z, b(P.roof === "brick" ? "brick_stairs" : `${P.roof}_stairs`, { facing: f, half: "bottom", shape: "straight", waterlogged: "false" })); } else v.set(x, G + 4, z, b(P.roof === "brick" ? "bricks" : `${P.roof}_planks`)); }
  v.set(cx, G + 5, cz, b(P.roof === "brick" ? "brick_slab" : `${P.roof}_slab`, { type: "bottom", waterlogged: "false" }));
  v.set(cx, G + 3, cz, b("chain", { axis: "y", waterlogged: "false" })); v.set(cx, G + 2, cz, b("chain", { axis: "y", waterlogged: "false" }));
  v.set(cx, G + 1, cz, lantern(true));
}

function lamp(v, x, z) { v.fill(x, G + 1, z, x, G + 4, z, fence("dark_oak")); v.set(x, G + 5, z, lantern(false)); }
function bannerPole(v, x, z, P) {
  v.fill(x, G + 1, z, x, G + 6, z, log("dark_oak"));
  for (const f of ["north", "south", "east", "west"]) { const [dx, dz] = DIRS[f]; v.set(x + dx, G + 4, z + dz, wallBanner(P.color, f)); v.set(x + dx, G + 5, z + dz, null); }
  v.set(x, G + 7, z, lantern(false));
}

function tree(v, x, z, r, kind = "oak") {
  const h = 4 + Math.floor(r() * 2);
  v.fill(x, G + 1, z, x, G + h, z, log(kind));
  for (let y = G + h - 2; y <= G + h + 1; y++) { const rad = y >= G + h ? 1 : 2; for (let dx = -rad; dx <= rad; dx++) for (let dz = -rad; dz <= rad; dz++) { if (Math.abs(dx) === rad && Math.abs(dz) === rad && (y >= G + h || r() < 0.5)) continue; if (!v.get(x + dx, y, z + dz)) v.set(x + dx, y, z + dz, leaves(kind)); } }
}

function farm(v, x0, z0, w, d, r) {
  const x1 = x0 + w - 1, z1 = z0 + d - 1, mid = Math.floor((z0 + z1) / 2);
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    const border = x === x0 || x === x1 || z === z0 || z === z1;
    if (border) { v.set(x, G + 1, z, fence("oak")); continue; }
    if (z === mid) { v.set(x, G, z, water()); v.set(x, G - 1, z, b("dirt")); continue; }
    v.set(x, G, z, farmland()); v.set(x, G + 1, z, crop(["wheat", "carrots", "potatoes"][(z < mid ? z - z0 : z - mid) % 3], 7));
  }
  const gx = Math.floor((x0 + x1) / 2); v.set(gx, G + 1, z0, b("oak_fence_gate", { facing: "north", open: "false", powered: "false", in_wall: "false" }));
  v.set(x0, G + 2, z0, lantern(false)); v.set(x1, G + 2, z1, lantern(false));
  v.set(x0 + 1, G, z1 - 1, b("coarse_dirt")); v.set(x0 + 1, G + 1, z1 - 1, fence("oak")); v.set(x0 + 1, G + 2, z1 - 1, b("carved_pumpkin", { facing: "south" }));
}

function tower(v, P, cx, cz, r, inner) {
  const x0 = cx - 2, x1 = cx + 2, z0 = cz - 2, z1 = cz + 2, top = G + 9;
  v.fill(x0, G, z0, x1, G, z1, b("cobblestone"));
  for (let y = G + 1; y <= top; y++) for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (x === x0 || x === x1 || z === z0 || z === z1) v.set(x, y, z, b(pick(r, ["stone_bricks", "stone_bricks", "stone_bricks", "mossy_stone_bricks", "cracked_stone_bricks"])));
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) v.fill(x, G + 1, z, x, top, z, b("stone_bricks"));
  v.fill(x0, G + 1, z0, x1, G + 1, z1, null); v.fill(x0 + 1, G, z0 + 1, x1 - 1, G, z1 - 1, b("spruce_planks"));
  v.walls(x0, G + 1, z0, x1, G + 1, z1, b("cobblestone"));
  // bandas de madera
  for (const y of [G + 5, top]) for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (x === x0 || x === x1 || z === z0 || z === z1) v.set(x, y, z, log("dark_oak", (z === z0 || z === z1) ? "x" : "z"));
  // suelo intermedio con hueco y escalera de mano
  v.fill(x0 + 1, G + 5, z0 + 1, x1 - 1, G + 5, z1 - 1, b("spruce_planks"));
  const lx = inner > 0 ? x0 + 1 : x1 - 1, lf = inner > 0 ? "east" : "west";
  v.set(lx, G + 5, cz, null);
  for (let y = G + 1; y <= G + 6; y++) v.set(lx, y, cz, b("ladder", { facing: lf, waterlogged: "false" }));
  // puerta hacia el interior del pueblo + aspilleras
  const dx = inner > 0 ? x1 : x0, dfac = inner > 0 ? "east" : "west";
  v.set(dx, G + 1, cz, null); v.set(dx, G + 2, cz, null); placeDoor(v, "spruce", dx, G + 1, cz, dfac);
  const slit = () => b("iron_bars", { north: "false", south: "false", east: "false", west: "false", waterlogged: "false" });
  for (const y of [G + 3, G + 7]) { v.set(cx, y, z0, slit()); v.set(cx, y, z1, slit()); v.set(inner > 0 ? x0 : x1, y, cz + 1, slit()); }
  v.set(cx, G + 2, cz, b("lantern", { hanging: "false", waterlogged: "false" })); v.set(cx, G + 1, cz, b("spruce_planks"));
  // tejado piramidal
  const st = (f) => b(P.roof === "brick" ? "brick_stairs" : `${P.roof}_stairs`, { facing: f, half: "bottom", shape: "straight", waterlogged: "false" });
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
  const lo = 2, hi = 62, gates = { south: true, east: true, west: true };
  for (let i = lo; i <= hi; i++) for (const [x, z] of [[i, lo], [i, hi], [lo, i], [hi, i]]) {
    for (let y = G + 1; y <= G + 5; y++) v.set(x, y, z, b(pick(r, ["stone_bricks", "stone_bricks", "stone_bricks", "stone_bricks", "mossy_stone_bricks", "cracked_stone_bricks"])));
    v.set(x, G, z, b("cobblestone"));
    if (i % 2 === 0) v.set(x, G + 6, z, b("stone_bricks"));
  }
  const gate = (side) => {
    const cells = []; for (let t = 30; t <= 34; t++) cells.push(side === "south" ? [t, 62] : side === "east" ? [62, t] : [2, t]);
    for (const [x, z] of cells) { v.clear(x, G + 1, z, x, G + 4, z); v.set(x, G + 6, z, null); v.set(x, G, z, b("dirt_path")); v.set(x, G + 5, z, log("dark_oak", side === "south" ? "x" : "z")); }
    const pill = side === "south" ? [[29, 62], [35, 62]] : side === "east" ? [[62, 29], [62, 35]] : [[2, 29], [2, 35]];
    for (const [x, z] of pill) { v.fill(x, G + 1, z, x, G + 6, z, log("dark_oak")); }
    const out = side === "south" ? "south" : side; const [ox, oz] = DIRS[out];
    for (const [x, z] of pill) v.set(x + ox, G + 4, z + oz, wallBanner(P.color, out));
    const [cx, cz] = cells[2]; v.set(cx, G + 4, cz, b("lantern", { hanging: "true", waterlogged: "false" }));
  };
  for (const s of Object.keys(gates)) gate(s);
}

let v;   // se reasigna en cada pueblo
function buildVillage(id) {
  const P = PALETTES[id], seed = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7), r = rng(seed);
  v = new Voxels(N, 26, N);
  v.fill(0, 0, 0, N - 1, G - 1, N - 1, b("dirt"));
  for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) v.set(x, G, z, b(r() < 0.04 ? "coarse_dirt" : "grass_block", r() < 2 ? { snowy: "false" } : {}));
  // caminos (tierra con bordes de grava) y plaza
  const path = (x, z) => v.set(x, G, z, b(r() < 0.2 ? "gravel" : "dirt_path"));
  for (let t = 3; t <= 61; t++) { for (let k = 30; k <= 34; k++) { if (t >= 36) path(k, t); path(t, k); } }   // sur, este, oeste
  for (let z = 19; z <= 24; z++) for (let x = 30; x <= 34; x++) path(x, z);                              // entrada del salón
  for (let x = 24; x <= 40; x++) for (let z = 24; z <= 40; z++) {
    const dx = x - 32, dz = z - 32, dist = Math.sqrt(dx * dx + dz * dz);
    let blk = "cobblestone";
    if (dist <= 7.5) blk = dist <= 2.5 ? "stone_bricks" : dist >= 6.3 ? "stone_bricks" : r() < 0.5 ? "polished_andesite" : "andesite";
    v.set(x, G, z, b(blk));
  }
  for (let x = 24; x <= 40; x++) { for (const z of [24, 40]) v.set(x, G, z, b("stone_bricks")); } for (let z = 24; z <= 40; z++) for (const x of [24, 40]) v.set(x, G, z, b("stone_bricks"));

  wallRing(v, P, r);
  for (const [cx, cz, inner] of [[4, 4, 1], [60, 4, -1], [4, 60, 1], [60, 60, -1]]) tower(v, P, cx, cz, r, inner);

  // edificios principales
  const hall = house(v, P, 22, 6, 21, 13, { door: "south", h: 6, chimney: false });
  const tavern = house(v, P, 46, 16, 14, 10, { door: "south", floors: 2, sign: ["Taberna"] });
  const fg = forge(v, P, 6, 21, 10, 8, r);
  const homes = [
    house(v, P, 9, 6, 10, 8, { door: "south" }),
    house(v, P, 47, 5, 9, 8, { door: "south" }),
    house(v, P, 7, 38, 9, 8, { door: "north", sign: ["Hogar"] }),
    house(v, P, 19, 39, 8, 7, { door: "north" }),
    house(v, P, 39, 39, 9, 8, { door: "north", floors: 2 }),
    house(v, P, 51, 40, 8, 8, { door: "north" }),
  ];
  homes.forEach((h, i) => { furnishHome(v, P, h, i % 2 ? "family" : "solo", r); yardDecor(v, P, h, r); });
  yardDecor(v, P, hall, r);

  // interior del salón del gremio
  hallInterior(v, P, hall, r);
  tavernInterior(v, P, tavern, r);

  // puestos de mercado
  stall(v, P, 41, 49, "food", r); stall(v, P, 48, 49, "arms", r); stall(v, P, 41, 55, "herbs", r);
  // granjas
  farm(v, 5, 49, 11, 11, r); farm(v, 19, 50, 9, 10, r);

  // plaza: pozo, estandartes, farolas
  well(v, 32, 32, P);
  for (const [x, z] of [[26, 26], [38, 26], [26, 38], [38, 38]]) bannerPole(v, x, z, P);
  for (const [x, z] of [[29, 29], [35, 29], [29, 35], [35, 35], [28, 22], [36, 22], [28, 44], [36, 44], [20, 29], [44, 29], [20, 35], [44, 35], [12, 35], [52, 35], [12, 29], [52, 29], [29, 52], [35, 52], [29, 58], [35, 58]]) lamp(v, x, z);
  // árboles sueltos y arbustos
  for (const [x, z] of [[8, 16], [20, 18], [44, 12], [60, 14], [15, 62 - 2], [47, 59], [60, 48], [6, 30 - 4], [58, 36], [27, 59]]) { if (!v.get(x, G + 1, z) && x > 5 && x < 59 && z > 5 && z < 59) tree(v, x, z, r, pick(r, ["oak", "oak", "birch"])); }
  // pequeños detalles: fardos, barriles y cubos junto al camino
  for (const [x, z] of [[17, 29], [47, 35], [36, 47], [28, 47]]) { v.set(x, G + 1, z, r() < 0.5 ? barrel("up") : hay()); }

  const info = { id, size: [N, 26, N], surface: G, spawn: [32, G + 1, 37], npc: hall.npcSpot, hall: [32, G + 1, 17], plaza: [32, G, 32] };
  return { nbt: v.toNbt(), info };
}

function hallInterior(v, P, h, r) {
  const { x0, z0, x1, z1 } = h, cx = Math.floor((x0 + x1) / 2), top = h.top;
  // tarima en el fondo con el NPC
  v.fill(cx - 4, G + 1, z0 + 1, cx + 4, G + 1, z0 + 3, b("stone_bricks"));
  for (let x = cx - 4; x <= cx + 4; x++) v.set(x, G + 1, z0 + 4, b("stone_brick_stairs", { facing: "north", half: "bottom", shape: "straight", waterlogged: "false" }));
  for (let x = cx - 1; x <= cx + 1; x++) v.set(x, G + 2, z0 + 2, carpet(P.color));
  v.set(cx, G + 2, z0 + 2, carpet(P.color));
  // alfombra de la puerta a la tarima
  for (let z = z0 + 5; z < z1; z++) { v.set(cx, G + 1, z, carpet(P.color)); v.set(cx - 1, G + 1, z, carpet("white")); v.set(cx + 1, G + 1, z, carpet("white")); }
  // estandartes detrás
  for (const dx of [-3, 0, 3]) { v.set(cx + dx, G + 3, z0 + 1, wallBanner(P.color, "south")); v.set(cx + dx, G + 4, z0 + 1, null); }
  for (const dx of [-2, 2]) v.set(cx + dx, G + 2, z0 + 1, b("lectern", { facing: "south", has_book: "false", powered: "false" }));
  v.set(cx, G + 2, z0 + 1, null);
  // vigas transversales con lámparas colgantes
  for (let x = x0 + 4; x < x1; x += 4) { for (let z = z0 + 1; z < z1; z++) v.set(x, top, z, log(P.beam, "z")); v.set(x, top - 1, z0 + 7, lantern(true)); v.set(x, top - 1, z1 - 3, lantern(true)); }
  // estanterías en las paredes laterales y mesas largas
  for (const x of [x0 + 1, x1 - 1]) for (let z = z0 + 6; z <= z1 - 2; z += 2) { v.set(x, G + 1, z, bookshelf()); v.set(x, G + 2, z, bookshelf()); }
  for (const tx of [cx - 5, cx + 5]) for (let z = z0 + 7; z <= z1 - 3; z++) { v.set(tx, G + 1, z, b("spruce_slab", { type: "top", waterlogged: "false" })); v.set(tx, G + 2, z, (z - z0) % 3 === 0 ? b("candle", { candles: "2", lit: "false", waterlogged: "false" }) : null);
    v.set(tx - 1, G + 1, z, stairs("spruce", "east")); v.set(tx + 1, G + 1, z, stairs("spruce", "west")); }
  // mapa y tablón de misiones junto a la puerta
  v.set(x0 + 1, G + 3, z1 - 1, b("barrel", { facing: "up", open: "false" })); v.set(x0 + 1, G + 3, z1 - 1, null);
  h.npcSpot = [cx, G + 2, z0 + 2];
}

function tavernInterior(v, P, t, r) {
  const { x0, z0, x1, z1 } = t, yf = G + 5;
  // barra
  for (let x = x0 + 7; x <= x1 - 2; x++) { v.set(x, G + 1, z0 + 2, b("spruce_slab", { type: "top", waterlogged: "false" })); v.set(x, G + 1, z0 + 1, barrel("up")); }
  v.set(x0 + 8, G + 2, z0 + 2, b("candle", { candles: "1", lit: "false", waterlogged: "false" }));
  for (let x = x0 + 8; x <= x1 - 3; x += 2) v.set(x, G + 2, z0 + 1, b("barrel", { facing: "up", open: "false" }));
  // mesas y taburetes
  for (const [mx, mz] of [[x0 + 7, z0 + 6], [x0 + 10, z0 + 6], [x0 + 6, z1 - 2]]) { table(v, mx, mz, P); v.set(mx, G + 2, mz, b("candle", { candles: "3", lit: "false", waterlogged: "false" })); v.set(mx - 1, G + 1, mz, stairs(P.trim, "west")); v.set(mx + 1, G + 1, mz, stairs(P.trim, "east")); }
  // chimenea y chimenea interior
  v.set(x1 - 1, G + 1, z1 - 2, b("campfire", { facing: "west", lit: "false", signal_fire: "false", waterlogged: "false" }));
  // alfombra
  for (let x = x0 + 6; x <= x0 + 11; x++) for (let z = z0 + 5; z <= z0 + 7; z++) if (!v.get(x, G + 1, z)) v.set(x, G + 1, z, carpet(P.color));
  // planta alta: camas y cofres
  for (let k = 0; k < 3; k++) { const bx = x0 + 8 + k * 2, c = k % 2 ? "white" : P.color; v.set(bx, yf + 1, z0 + 1, bed(c, "north", "head")); v.set(bx, yf + 1, z0 + 2, bed(c, "north", "foot")); }
  for (let k = 0; k < 2; k++) { const cx = x0 + 9 + k * 2; v.set(cx, yf + 1, z0 + 1, k ? b("chest", { facing: "south", type: "single", waterlogged: "false" }) : barrel("up")); v.set(cx, yf + 2, z0 + 1, lantern(false)); }
  v.set(x0 + 5, yf + 1, z1 - 1, bookshelf()); v.set(x0 + 5, yf + 2, z1 - 1, bookshelf());
  v.set(x0 + 9, yf + 1, z1 - 1, b("crafting_table"));
  for (const x of [x0 + 7, x0 + 11]) v.set(x, G + 4, z0 + 5, lantern(true));
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
