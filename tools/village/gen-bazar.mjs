// Generador del Bazar neutral del centro del mapa. Uso: node tools/village/gen-bazar.mjs [salidaDir]
// Produce <salidaDir>/bazar.nbt (estructura de Minecraft) y tools/village/out/bazar.json.
// Plantilla de 129 x 34 x 129 (igual que los pueblos): y=0..2 cimentación, y=3 suelo (SURF). Se coloca con /pueblo colocar bazar en (0,0).
// Ejes: x = este, z = sur. Muralla con 4 puertas (N, S, E, O), dos avenidas en cruz, fuente en el centro, puestos de mercado en los
// colores de cada gremio (cuadrante NO verde, NE azul, SO amarillo, SE rojo) y una casa de embajada de cada gremio en su esquina.
import { writeFileSync, mkdirSync } from "node:fs";
import { Voxels, b, log, fence, lantern, chest, barrel, carpet, bookshelf, anvil, grindstone, flowerPot, water, wallSign, banner, wall, DIRS } from "./voxel.mjs";
import { house, PALETTES, SURF } from "./buildings.mjs";

const G = SURF, N = 129, SY = 34, C = 64;
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hay = () => b("hay_block", { axis: "y" });
const hangLantern = () => b("lantern", { hanging: "true", waterlogged: "false" });
const slabBlk = (mat, type = "bottom") => b(`${mat}_slab`, { type, waterlogged: "false" });
const stairBlk = (mat, f, half = "bottom") => b(`${mat}_stairs`, { facing: f, half, shape: "straight", waterlogged: "false" });
const lectern = (f) => b("lectern", { facing: f, has_book: "false", powered: "false" });

// cuadrantes: color de gremio y signos (sx, sz) respecto al centro
const QUADS = [
  { id: "slytherion", nombre: "Slytheri0n", sx: -1, sz: -1 },
  { id: "ravencachalotes", nombre: "RavenCachalotes", sx: 1, sz: -1 },
  { id: "huffleponyanos", nombre: "Huffleponyanos", sx: -1, sz: 1 },
  { id: "tuliondor", nombre: "Tuliondor", sx: 1, sz: 1 },
];
const KINDS = ["food", "arms", "herbs", "wool"];

/** lámpara: poste de valla con farol arriba */
const SUELO_LAMPARA = /cobblestone|stone_bricks|polished_andesite|andesite|grass_block/;
function lamp(v, x, z) {
  const f = v.get(x, G, z);
  if (!f || !SUELO_LAMPARA.test(f.n) || v.get(x, G + 1, z)) return;   // solo sobre suelo firme y libre (no sobre agua ni dentro de casas)
  v.fill(x, G + 1, z, x, G + 3, z, fence("spruce"));
  v.set(x, G + 4, z, lantern(false));
}

/** posición mundo de la celda local (u a lo ancho 0..4, d de fondo 0..2; d=2 es el frente) de un puesto orientado hacia `f` */
function stallPos(x0, z0, f, u, d) {
  if (f === "south") return [x0 + u, z0 + d];
  if (f === "north") return [x0 + u, z0 + (2 - d)];
  if (f === "east") return [x0 + d, z0 + u];
  return [x0 + (2 - d), z0 + u];   // west
}

/** puesto de mercado de 5 x 3 con toldo a rayas del color del gremio; `f` = hacia dónde mira el mostrador (hacia la avenida) */
function stall(v, color, x0, z0, f, kind) {
  const at = (u, d) => stallPos(x0, z0, f, u, d);
  const yTop = G + 4;
  for (const [u, d] of [[0, 0], [4, 0], [0, 2], [4, 2]]) { const [x, z] = at(u, d); v.fill(x, G + 1, z, x, G + 3, z, fence("spruce")); }
  for (let u = -1; u <= 5; u++) for (let d = -1; d <= 3; d++) { const [x, z] = at(u, d); v.set(x, yTop, z, b(`${u % 2 === 0 ? color : "white"}_wool`)); }
  for (let u = -1; u <= 5; u++) { const [x, z] = at(u, 3); v.set(x, yTop - 1, z, carpet(u % 2 === 0 ? color : "white")); }   // faldón del toldo
  for (let u = 1; u <= 3; u++) { const [x, z] = at(u, 2); v.set(x, G + 1, z, b("spruce_slab", { type: "top", waterlogged: "false" })); }   // mostrador
  for (const u of [0, 4]) { const [x, z] = at(u, 1); v.set(x, G + 1, z, barrel("up")); }
  const goods = (i, blk) => { const [x, z] = at(1 + i, 2); v.set(x, G + 2, z, blk); };
  const back = (u, blk, y = G + 1) => { const [x, z] = at(u, 0); v.set(x, y, z, blk); };
  if (kind === "food") { goods(0, b("pumpkin")); goods(1, b("melon")); goods(2, hay()); back(1, barrel("up")); back(2, barrel("up")); back(3, b("composter", { level: "4" })); }
  if (kind === "arms") { goods(0, b(`${color}_banner`, { rotation: "8" })); goods(1, b("blast_furnace", { facing: f, lit: "false" })); goods(2, anvil("east")); back(1, chest(f)); back(3, b("grindstone", { face: "floor", facing: f })); }
  if (kind === "herbs") { goods(0, flowerPot("red_tulip")); goods(1, flowerPot("cornflower")); goods(2, flowerPot("oxeye_daisy")); back(1, b("brewing_stand", { has_bottle_0: "false", has_bottle_1: "false", has_bottle_2: "false" })); back(2, b("water_cauldron", { level: "3" })); back(3, lectern(f)); }
  if (kind === "wool") { goods(0, b("white_wool")); goods(1, b(`${color}_wool`)); goods(2, b("black_wool")); back(1, b("loom", { facing: f })); back(2, barrel("up")); back(3, b("cartography_table")); }
  const [lx, lz] = at(2, 1);
  v.set(lx, yTop - 1, lz, hangLantern());   // el farol cuelga del toldo
}

function buildBazar() {
  const v = new Voxels(N, SY, N), r = rng(20261004);
  // ---- suelo: cimentación de tierra, hierba en el borde y adoquín dentro de la muralla -----------------------------------
  v.fill(0, 0, 0, N - 1, G - 1, N - 1, b("dirt"));
  v.fill(0, G, 0, N - 1, G, N - 1, b("grass_block", { snowy: "false" }));
  const inAve = (x, z) => Math.abs(x - C) <= 3 || Math.abs(z - C) <= 3;
  for (let x = 7; x <= N - 8; x++) for (let z = 7; z <= N - 8; z++) {
    const dist = Math.max(Math.abs(x - C), Math.abs(z - C));
    let blk;
    if (inAve(x, z)) blk = "polished_andesite";
    else if (dist <= 13) blk = (x + z) % 2 === 0 ? "stone_bricks" : "polished_andesite";   // plaza en damero
    else { const p = r(); blk = p < 0.78 ? "cobblestone" : p < 0.9 ? "stone_bricks" : p < 0.96 ? "mossy_cobblestone" : "andesite"; }
    v.set(x, G, z, b(blk));
  }
  // ---- muralla (3 de grosor, 6 de alto, almenas) con 4 puertas de 7 de ancho ------------------------------------------
  const m0 = 4, m1 = N - 5;
  const ring = (x, z) => (x >= m0 && x <= m1 && z >= m0 && z <= m1) && !(x >= m0 + 3 && x <= m1 - 3 && z >= m0 + 3 && z <= m1 - 3);
  for (let x = m0; x <= m1; x++) for (let z = m0; z <= m1; z++) {
    if (!ring(x, z)) continue;
    v.fill(x, G, z, x, G + 6, z, b(r() < 0.12 ? "mossy_stone_bricks" : "stone_bricks"));
    if ((x + z) % 2 === 0) v.set(x, G + 7, z, wall("stone_brick"));   // almenas
  }
  for (const [axis, side] of [["x", 0], ["x", 1], ["z", 0], ["z", 1]]) {   // puertas: abrir un hueco de 7 x 5 en el centro de cada lado
    for (let o = -3; o <= 3; o++) for (let t = 0; t < 3; t++) {
      const k = side === 0 ? m0 + t : m1 - t;
      const x = axis === "x" ? C + o : k, z = axis === "x" ? k : C + o;
      v.clear(x, G + 1, z, x, G + 5, z); v.set(x, G + 7, z, null);
      v.set(x, G, z, b("polished_andesite"));
    }
    const k = side === 0 ? m0 : m1, face = axis === "x" ? (side === 0 ? "north" : "south") : (side === 0 ? "west" : "east");
    for (const o of [-2, 2]) { const x = axis === "x" ? C + o : k, z = axis === "x" ? k : C + o; v.set(x, G + 5, z, hangLantern()); }   // faroles bajo el dintel
    // cartel sobre el dintel, en la cara exterior
    const [dx, dz] = DIRS[face];
    const sx_ = axis === "x" ? C : k + dx, sz_ = axis === "x" ? k + dz : C;
    const nombre = { north: "Puerta Norte", south: "Puerta Sur", east: "Puerta Este", west: "Puerta Oeste" }[face];
    v.set(sx_, G + 6, sz_, wallSign("spruce", face, ["Bazar de los", "Cuatro Gremios", nombre, ""]));   // pegado al dintel (G+6)
  }
  // ---- torres de las esquinas (9 x 9, 11 de alto) -----------------------------------------------------------------------
  for (const [tx, tz] of [[m0 - 1, m0 - 1], [m1 - 7, m0 - 1], [m0 - 1, m1 - 7], [m1 - 7, m1 - 7]]) {
    for (let x = tx; x < tx + 9; x++) for (let z = tz; z < tz + 9; z++) {
      v.fill(x, G, z, x, G + 11, z, b(r() < 0.1 ? "mossy_stone_bricks" : "stone_bricks"));
      const edge = x === tx || x === tx + 8 || z === tz || z === tz + 8;
      if (edge && (x + z) % 2 === 0) v.set(x, G + 12, z, wall("stone_brick"));
    }
    v.set(tx + 4, G + 12, tz + 4, lantern(false));
  }
  // ---- fuente central -------------------------------------------------------------------------------------------------
  for (let x = C - 7; x <= C + 7; x++) for (let z = C - 7; z <= C + 7; z++) {
    const d = Math.max(Math.abs(x - C), Math.abs(z - C));
    if (d >= 6) { v.set(x, G, z, b("stone_bricks")); v.set(x, G + 1, z, b("stone_bricks")); }
    else { v.set(x, G - 1, z, b("stone_bricks")); v.set(x, G, z, water()); }
  }
  for (const [cx, cz] of [[C - 7, C - 7], [C + 7, C - 7], [C - 7, C + 7], [C + 7, C + 7]]) v.set(cx, G + 2, cz, lantern(false));   // esquinas del brocal
  for (let x = C - 1; x <= C + 1; x++) for (let z = C - 1; z <= C + 1; z++) v.fill(x, G, z, x, G + 4, z, b("stone_bricks"));
  v.set(C, G + 5, C, wall("stone_brick")); v.set(C, G + 6, C, b("sea_lantern"));
  for (const [f, lines] of [["north", ["BAZAR", "NEUTRAL", "", ""]], ["south", ["Comercio libre", "entre gremios", "", ""]], ["east", ["Prohibido", "robar", "", ""]], ["west", ["Que gane", "el mejor", "mercader", ""]]]) {
    const [dx, dz] = DIRS[f];
    v.set(C + dx * 2, G + 3, C + dz * 2, wallSign("spruce", f, lines));
  }
  // ---- puestos de mercado a lo largo de las dos avenidas (toldo del color del gremio de cada cuadrante) ---------------
  const slots = [];
  for (let t = 15; t <= 47; t += 8) slots.push(t);                  // mitad norte/oeste (5 puestos por lado y tramo)
  for (let t = 81; t <= 113; t += 8) slots.push(t);                 // mitad sur/este
  let kindIdx = 0;
  for (const t of slots) {
    const east = t > C, northHalf = t < C;
    // avenida norte-sur (x ~ C): lado oeste mira al este, lado este mira al oeste; el cuadrante depende de la mitad (norte/sur)
    const qWest = QUADS.find((q) => q.sx === -1 && q.sz === (northHalf ? -1 : 1)), qEast = QUADS.find((q) => q.sx === 1 && q.sz === (northHalf ? -1 : 1));
    stall(v, PALETTES[qWest.id].color, C - 9, t, "east", KINDS[kindIdx++ % 4]);
    stall(v, PALETTES[qEast.id].color, C + 7, t, "west", KINDS[kindIdx++ % 4]);
    // avenida este-oeste (z ~ C): lado norte mira al sur, lado sur mira al norte; el cuadrante depende de la mitad (oeste/este)
    const qNorth = QUADS.find((q) => q.sz === -1 && q.sx === (east ? 1 : -1)), qSouth = QUADS.find((q) => q.sz === 1 && q.sx === (east ? 1 : -1));
    stall(v, PALETTES[qNorth.id].color, t, C - 9, "south", KINDS[kindIdx++ % 4]);
    stall(v, PALETTES[qSouth.id].color, t, C + 7, "north", KINDS[kindIdx++ % 4]);
  }
  // ---- casas de embajada de cada gremio en su esquina (17 x 13, dos plantas) ----------------------------------------
  const houses = [];
  for (const q of QUADS) {
    const P = PALETTES[q.id], w = 17, d = 13;
    const x0 = q.sx < 0 ? 15 : N - 15 - w, z0 = q.sz < 0 ? 15 : N - 15 - d;
    const h = house(v, P, x0, z0, w, d, { door: q.sx < 0 ? "east" : "west", floors: 2, sign: ["Embajada", q.nombre, "", ""] });
    // mobiliario mínimo y luz: mostrador de cambio, cofres, barriles con farol, estantería
    const ix = q.sx < 0 ? x0 + 2 : x1(x0, w) - 2;
    for (let k = 0; k < 3; k++) {
      const z = z0 + 3 + k * 3;
      v.set(ix, G + 1, z, k === 1 ? chest(q.sx < 0 ? "east" : "west") : barrel("up"));
      if (k !== 1) v.set(ix, G + 2, z, lantern(false));
    }
    v.set(x0 + Math.floor(w / 2), G + 1, z0 + 1, bookshelf()); v.set(x0 + Math.floor(w / 2), G + 2, z0 + 1, bookshelf());
    // asta con bandera del gremio delante de la casa
    const fx = h.door[0] + (q.sx < 0 ? 4 : -4), fz = h.door[1] + 3;
    v.fill(fx, G + 1, fz, fx, G + 6, fz, fence("spruce")); v.set(fx, G + 7, fz, banner(P.color, 0));
    houses.push({ id: q.id, x0, z0, w, d });
  }
  // ---- farolas por todo el recinto (cada 12 bloques; en las avenidas, a ambos lados cada 8) ---------------------------
  for (let x = 13; x <= N - 14; x += 12) for (let z = 13; z <= N - 14; z += 12) lamp(v, x, z);
  for (let t = 11; t <= N - 12; t += 8) { for (const o of [-4, 4]) { lamp(v, C + o, t); lamp(v, t, C + o); } }
  const info = { id: "bazar", size: [N, SY, N], surface: G, spawn: [C, G + 1, C + 16], plaza: [C, G, C], houses };
  return { nbt: v.toNbt(), info };
}
const x1 = (x0, w) => x0 + w - 1;

const outDir = process.argv[2] || "kubejs/data/pony0n/structures";
mkdirSync(outDir, { recursive: true }); mkdirSync("tools/village/out", { recursive: true });
const { nbt, info } = buildBazar();
writeFileSync(`${outDir}/bazar.nbt`, nbt);
writeFileSync("tools/village/out/bazar.json", JSON.stringify(info, null, 2));
console.log(`bazar.nbt  ${nbt.length} bytes  spawn=${info.spawn}`);
