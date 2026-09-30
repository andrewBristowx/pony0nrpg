// Lector/escritor mínimo de NBT (gzip) para estructuras de Minecraft. Sin dependencias.
// Lectura: compuestos -> objetos, listas -> arrays, enteros -> number, long -> BigInt.
// Escritura: los valores se tipan con T.* (T.int(3), T.str("x"), T.list([...], "int"), T.comp({...})).
import { gunzipSync, gzipSync } from "node:zlib";

export const TAG = { End: 0, Byte: 1, Short: 2, Int: 3, Long: 4, Float: 5, Double: 6, ByteArray: 7, String: 8, List: 9, Compound: 10, IntArray: 11, LongArray: 12 };

// ---- lectura ---------------------------------------------------------------------------------------------------
export function readNbt(buf) {
  let data = buf;
  try { data = gunzipSync(buf); } catch { /* ya sin comprimir */ }
  let o = 0;
  const u8 = () => data[o++];
  const i16 = () => { const v = data.readInt16BE(o); o += 2; return v; };
  const i32 = () => { const v = data.readInt32BE(o); o += 4; return v; };
  const i64 = () => { const v = data.readBigInt64BE(o); o += 8; return v; };
  const f32 = () => { const v = data.readFloatBE(o); o += 4; return v; };
  const f64 = () => { const v = data.readDoubleBE(o); o += 8; return v; };
  const str = () => { const n = data.readUInt16BE(o); o += 2; const s = data.toString("utf8", o, o + n); o += n; return s; };
  const payload = (t) => {
    switch (t) {
      case TAG.Byte: return data.readInt8(o++);
      case TAG.Short: return i16();
      case TAG.Int: return i32();
      case TAG.Long: return i64();
      case TAG.Float: return f32();
      case TAG.Double: return f64();
      case TAG.ByteArray: { const n = i32(); const a = data.subarray(o, o + n); o += n; return a; }
      case TAG.String: return str();
      case TAG.List: { const it = u8(); const n = i32(); const a = []; for (let k = 0; k < n; k++) a.push(payload(it)); return a; }
      case TAG.Compound: { const c = {}; for (;;) { const tt = u8(); if (tt === 0) break; const name = str(); c[name] = payload(tt); } return c; }
      case TAG.IntArray: { const n = i32(); const a = []; for (let k = 0; k < n; k++) a.push(i32()); return a; }
      case TAG.LongArray: { const n = i32(); const a = []; for (let k = 0; k < n; k++) a.push(i64()); return a; }
      default: throw new Error("tag desconocido " + t);
    }
  };
  const rootType = u8();
  if (rootType !== TAG.Compound) throw new Error("la raíz no es un compuesto");
  str(); // nombre de la raíz
  return payload(TAG.Compound);
}

// ---- escritura -------------------------------------------------------------------------------------------------
export const T = {
  byte: (v) => ({ __t: TAG.Byte, v }),
  short: (v) => ({ __t: TAG.Short, v }),
  int: (v) => ({ __t: TAG.Int, v }),
  str: (v) => ({ __t: TAG.String, v }),
  list: (v, type) => ({ __t: TAG.List, v, type }),   // type: "int" | "str" | "comp" | "double" | "float" | ...
  comp: (v) => ({ __t: TAG.Compound, v }),
  double: (v) => ({ __t: TAG.Double, v }),
  float: (v) => ({ __t: TAG.Float, v }),
};
const TYPE_BY_NAME = { byte: TAG.Byte, short: TAG.Short, int: TAG.Int, long: TAG.Long, float: TAG.Float, double: TAG.Double, str: TAG.String, comp: TAG.Compound, list: TAG.List };

export function writeNbt(root) {
  const chunks = [];
  const push = (b) => chunks.push(b);
  const wU8 = (v) => push(Buffer.from([v & 255]));
  const wI16 = (v) => { const b = Buffer.alloc(2); b.writeInt16BE(v); push(b); };
  const wI32 = (v) => { const b = Buffer.alloc(4); b.writeInt32BE(v); push(b); };
  const wStr = (s) => { const sb = Buffer.from(s, "utf8"); const b = Buffer.alloc(2); b.writeUInt16BE(sb.length); push(b); push(sb); };
  const writePayload = (node) => {
    switch (node.__t) {
      case TAG.Byte: wU8(node.v); break;
      case TAG.Short: wI16(node.v); break;
      case TAG.Int: wI32(node.v); break;
      case TAG.Float: { const b = Buffer.alloc(4); b.writeFloatBE(node.v); push(b); break; }
      case TAG.Double: { const b = Buffer.alloc(8); b.writeDoubleBE(node.v); push(b); break; }
      case TAG.String: wStr(node.v); break;
      case TAG.List: {
        const it = TYPE_BY_NAME[node.type] ?? TAG.End;
        wU8(node.v.length ? it : 0);
        wI32(node.v.length);
        for (const x of node.v) {
          if (it === TAG.Int) wI32(x.__t ? x.v : x);
          else if (it === TAG.String) wStr(x.__t ? x.v : x);
          else if (it === TAG.Double) { const b = Buffer.alloc(8); b.writeDoubleBE(x.__t ? x.v : x); push(b); }
          else if (it === TAG.Float) { const b = Buffer.alloc(4); b.writeFloatBE(x.__t ? x.v : x); push(b); }
          else writePayload(x);
        }
        break;
      }
      case TAG.Compound:
        for (const [k, val] of Object.entries(node.v)) { wU8(val.__t); wStr(k); writePayload(val); }
        wU8(0);
        break;
      default: throw new Error("tipo no soportado al escribir: " + node.__t);
    }
  };
  wU8(TAG.Compound); wStr("");
  writePayload(root.__t ? root : T.comp(root));
  return gzipSync(Buffer.concat(chunks));
}
