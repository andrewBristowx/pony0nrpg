// Edificios medievales para el pueblo inicial, construidos con las mismas ideas que las casas de vanilla que se estudiaron
// (tools/village/dump.mjs): base de adoquín, esquinas de tronco, paredes de entramado, ventanas de cristal, tejado de escaleras
// a dos aguas con alero, chimenea y mobiliario dentro. Ejes: x = este, z = sur, y = arriba. SURF = nivel del suelo.
import { b, stairs, slab, log, door, trapdoor, fence, fenceGate, lantern, chest, barrel, furnace, wallTorch, bed, banner, wallBanner, carpet, bookshelf,
  hay, glassPane, crop, farmland, anvil, grindstone, campfire, flowerPot, leaves, water, wallSign, OPP, DIRS } from "./voxel.mjs";

export const SURF = 3;   // nivel del suelo dentro de la plantilla (por debajo hay 3 capas de cimentación)

export const PALETTES = {
  slytherion:      { color: "green",  roof: "dark_oak", beam: "dark_oak", floor: "spruce", trim: "spruce", base: "cobblestone" },
  ravencachalotes: { color: "blue",   roof: "spruce",   beam: "dark_oak", floor: "spruce", trim: "spruce", base: "stone_bricks" },
  huffleponyanos:  { color: "yellow", roof: "oak",      beam: "spruce",   floor: "oak",    trim: "oak",    base: "cobblestone" },
  tuliondor:       { color: "red",    roof: "brick",    beam: "dark_oak", floor: "spruce", trim: "spruce", base: "stone_bricks" },
};
const PLASTER = "white_terracotta";

const roofStairs = (P, facing, half = "bottom") => (P.roof === "brick" ? b("brick_stairs", { facing, half, shape: "straight", waterlogged: "false" }) : stairs(P.roof, facing, half));
const roofSlab = (P, type = "bottom") => (P.roof === "brick" ? b("brick_slab", { type, waterlogged: "false" }) : slab(P.roof, type));
const roofFull = (P) => (P.roof === "brick" ? b("bricks") : b(`${P.roof}_planks`));

/** tejado a dos aguas. ridge = "x" (cumbrera a lo largo de x, aleros en z) o "z". Devuelve la altura de cada fila (para rellenar los frontones). */
export function gableRoof(v, P, x0, z0, x1, z1, yBase, ridge, over = 1) {
  const along0 = ridge === "x" ? x0 - over : z0 - over, along1 = ridge === "x" ? x1 + over : z1 + over;
  const a0 = ridge === "x" ? z0 : x0, a1 = ridge === "x" ? z1 : x1;
  const span = a1 - a0 + 1 + 2 * over;
  const heights = [];
  for (let p = 0; p < span; p++) {
    const h = Math.min(p, span - 1 - p), y = yBase + h, pos = a0 - over + p;
    heights.push({ pos, y });
    const isLow = p < span - 1 - p, isHigh = p > span - 1 - p;
    // facing = hacia donde sube la escalera (hacia la cumbrera)
    const facing = ridge === "x" ? (isLow ? "south" : "north") : (isLow ? "east" : "west");
    for (let t = along0; t <= along1; t++) {
      const X = ridge === "x" ? t : pos, Z = ridge === "x" ? pos : t;
      if (isLow || isHigh) v.set(X, y, Z, roofStairs(P, facing));
      else { v.set(X, y - 1, Z, roofFull(P)); v.set(X, y, Z, roofSlab(P)); }   // cumbrera (span impar)
    }
  }
  return heights;
}

/** fronton (triángulo de pared bajo el tejado) en los dos extremos de la cumbrera */
export function gables(v, P, x0, z0, x1, z1, yBase, ridge, heights, window) {
  const ends = ridge === "x" ? [x0, x1] : [z0, z1];
  for (const e of ends) {
    for (const { pos, y } of heights) {
      const inside = ridge === "x" ? pos >= z0 && pos <= z1 : pos >= x0 && pos <= x1;
      if (!inside) continue;
      for (let yy = yBase; yy < y; yy++) {
        const X = ridge === "x" ? e : pos, Z = ridge === "x" ? pos : e;
        v.set(X, yy, Z, b(PLASTER));
      }
    }
    // ventana en el fronton
    if (window) {
      const mid = ridge === "x" ? Math.floor((z0 + z1) / 2) : Math.floor((x0 + x1) / 2);
      const X = ridge === "x" ? e : mid, Z = ridge === "x" ? mid : e;
      v.set(X, yBase, Z, glassPane());
    }
  }
}

/** puerta de dos bloques; facing = hacia dónde "mira" la puerta (hacia fuera del edificio) */
export function placeDoor(v, mat, x, y, z, facing, hinge = "left") {
  v.set(x, y, z, door(mat, facing, "lower", hinge));
  v.set(x, y + 1, z, door(mat, facing, "upper", hinge));
}

/** casa de entramado. o: { door: "north"|"south"|"east"|"west", h: altura de paredes, ridge, floors: 1|2, chimney: bool, sign: [..] } */
export function house(v, P, x0, z0, w, d, o = {}) {
  const x1 = x0 + w - 1, z1 = z0 + d - 1, y0 = SURF, floors = o.floors || 1, h = (o.h || 4) + (floors === 2 ? 4 : 0);
  const ridge = o.ridge || (w >= d ? "x" : "z"), top = y0 + h;
  v.fill(x0, y0, z0, x1, y0, z1, b(`${P.floor}_planks`));                      // suelo
  v.fill(x0 - 1, y0 - 1, z0 - 1, x1 + 1, y0 - 1, z1 + 1, b(P.base));           // zócalo visible alrededor
  v.walls(x0, y0 + 1, z0, x1, top - 1, z1, b(PLASTER));                        // paredes
  v.walls(x0, y0 + 1, z0, x1, y0 + 1, z1, b(P.base));                          // primera hilada de piedra
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) v.fill(cx, y0 + 1, cz, cx, top, cz, log(P.beam));   // esquinas
  // vigas superiores (logs horizontales)
  for (let x = x0 + 1; x < x1; x++) { v.set(x, top, z0, log(P.beam, "x")); v.set(x, top, z1, log(P.beam, "x")); }
  for (let z = z0 + 1; z < z1; z++) { v.set(x0, top, z, log(P.beam, "z")); v.set(x1, top, z, log(P.beam, "z")); }
  if (floors === 2) {   // viga de separación de pisos + suelo
    const yf = y0 + 5;
    for (let x = x0 + 1; x < x1; x++) { v.set(x, yf, z0, log(P.beam, "x")); v.set(x, yf, z1, log(P.beam, "x")); }
    for (let z = z0 + 1; z < z1; z++) { v.set(x0, yf, z, log(P.beam, "z")); v.set(x1, yf, z, log(P.beam, "z")); }
    v.fill(x0 + 1, yf, z0 + 1, x1 - 1, yf, z1 - 1, b(`${P.floor}_planks`));
  }
  // entramado: postes intermedios cada 4 bloques
  const posts = (along, len, fixedA, fixedB, axisFix) => {
    for (let t = 4; t < len - 1; t += 4) {
      for (const f of [fixedA, fixedB]) {
        const X = axisFix === "z" ? along + t : f, Z = axisFix === "z" ? f : along + t;
        v.fill(X, y0 + 2, Z, X, top - 1, Z, log(P.beam));
      }
    }
  };
  posts(x0, w, z0, z1, "z"); posts(z0, d, x0, x1, "x");

  // frontones y tejado
  const heights = gableRoof(v, P, x0, z0, x1, z1, top + 1, ridge);
  gables(v, P, x0, z0, x1, z1, top + 1, ridge, heights, true);

  // puerta (centro de la pared indicada) y ventanas
  const dd = o.door || "south";
  const doorPos = { north: [Math.floor((x0 + x1) / 2), z0], south: [Math.floor((x0 + x1) / 2), z1], west: [x0, Math.floor((z0 + z1) / 2)], east: [x1, Math.floor((z0 + z1) / 2)] }[dd];
  v.set(doorPos[0], y0 + 1, doorPos[1], null); v.set(doorPos[0], y0 + 2, doorPos[1], null);
  placeDoor(v, P.trim, doorPos[0], y0 + 1, doorPos[1], dd);
  const [dx, dz] = DIRS[dd];
  v.set(doorPos[0] + dx, y0, doorPos[1] + dz, b("cobblestone_slab", { type: "bottom", waterlogged: "false" }));   // umbral
  v.set(doorPos[0] + dx, y0 + 1, doorPos[1] + dz, null);
  // antorchas a los lados de la puerta
  const side = dd === "north" || dd === "south" ? [[1, 0], [-1, 0]] : [[0, 1], [0, -1]];
  for (const [sx_, sz_] of side) v.set(doorPos[0] + sx_ + dx, y0 + 3, doorPos[1] + sz_ + dz, wallTorch(dd));

  const winLevels = o.winY ? o.winY.map((k) => y0 + k) : floors === 2 ? [y0 + 2, y0 + 6] : [y0 + 2];
  const windowAt = (wx, wz, facing) => {   // facing = hacia fuera
    for (const yy of winLevels) {
      v.set(wx, yy, wz, glassPane()); v.set(wx, yy + 1, wz, glassPane());
      const [ox, oz] = DIRS[facing]; const perp = facing === "north" || facing === "south" ? [[1, 0], [-1, 0]] : [[0, 1], [0, -1]];
      for (const [px, pz] of perp) for (const dy of [0, 1]) v.set(wx + ox + px, yy + dy, wz + oz + pz, trapdoor(P.trim, facing));   // contraventanas
    }
  };
  const longSides = ridge === "x" ? ["north", "south"] : ["west", "east"];
  for (const s of longSides) {
    const len = ridge === "x" ? w : d;
    for (let t = 2; t < len - 2; t += 3) {
      const wx = ridge === "x" ? x0 + t : (s === "west" ? x0 : x1), wz = ridge === "x" ? (s === "north" ? z0 : z1) : z0 + t;
      if (s === dd && Math.abs((ridge === "x" ? wx - doorPos[0] : wz - doorPos[1])) < 2) continue;
      windowAt(wx, wz, s);
    }
  }
  if (floors === 2) {   // escalera interior a la planta alta: de un solo ancho, pegada a la pared oeste, con baranda en el hueco
    const sxp = x0 + 1, szp = z0 + 1;
    // 5 peldaños (suben hacia el sur): el último sustituye al suelo de la planta alta, así su cara superior queda a la altura del suelo de arriba
    for (let i = 0; i < 5; i++) {
      v.set(sxp, y0 + 1 + i, szp + i, stairs(P.floor, "south"));
      if (i < 4) { v.set(sxp, y0 + 5, szp + i, null); v.set(sxp + 1, y0 + 6, szp + i, fence(P.trim)); }   // hueco y baranda
    }
    v.set(sxp + 1, y0 + 6, szp + 4, fence(P.trim));   // la baranda llega hasta el último peldaño (que queda libre para subir)
  }
  // chimenea
  if (o.chimney !== false) {
    const cx = ridge === "x" ? x1 - 1 : Math.floor((x0 + x1) / 2), cz = ridge === "x" ? Math.floor((z0 + z1) / 2) : z1 - 1;
    const ridgeY = top + 1 + Math.floor((ridge === "x" ? d + 2 : w + 2) / 2 - 0.5) + 1;
    v.fill(cx, y0 + 1, cz, cx, ridgeY + 2, cz, b("stone_bricks"));
    const fdir = ridge === "x" ? "west" : "north";
    const fx = cx + DIRS[fdir][0], fz = cz + DIRS[fdir][1];
    v.set(fx, y0 + 1, fz, furnace("furnace", fdir));
    v.set(cx, ridgeY + 3, cz, b("stone_brick_slab", { type: "bottom", waterlogged: "false" }));
  }
  if (o.sign) { const [sx_, sz_] = DIRS[dd]; v.set(doorPos[0] + sx_ * 1 + (dd === "north" || dd === "south" ? 2 : 0), y0 + 3, doorPos[1] + sz_ * 1 + (dd === "east" || dd === "west" ? 2 : 0), wallSign(P.trim, dd, o.sign)); }
  return { x0, z0, x1, z1, door: doorPos, doorDir: dd, top, ridge };
}
