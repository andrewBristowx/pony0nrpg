// Roles de combate (Tanque, DPS, Healer, Soporte) y sus maestros (NPC de Easy NPC) en cada pueblo.
//  - Cada pueblo tiene 4 maestros de rol (caballeros con distintas skins) cerca de la plaza. Al hablar con uno:
//      1) si tu clase no puede ese rol, te dice cuales puedes;  2) si puedes, te explica el rol y te pide CONFIRMAR (no se puede cambiar).
//  - /rol confirmar concede el stage rol_<id> (se ve junto al nombre en el chat y el TAB, y desbloquea el capitulo de misiones de ese rol en
//    FTB Quests) y entrega el kit de inicio del rol segun tu clase. Cada mision del capitulo llama a /rol recompensa <rol> <nivel> <jugador>,
//    que da objetos y mejoras de atributos segun tu clase y tu rol.
//  - Comandos:  /rol (tu rol)   /rol hablar <rol> <jugador> (lo usa el NPC)   /rol confirmar <rol>
//               (operador)  /rol reset <jugador>   /rol recompensa <rol> <nivel> <jugador>   /rol npcs (recoloca los maestros)
// OJO (Rhino de este pack): `const`/`let` DENTRO de un try da "redeclaration of var"; dentro de try se usa `var`.

const CLASES = ['guerrero', 'arquero', 'mago', 'asesino', 'ingeniero'];
const NOMBRE_CLASE = { guerrero: 'Guerrero', arquero: 'Arquero', mago: 'Mago', asesino: 'Asesino', ingeniero: 'Ingeniero' };

// Que roles puede elegir cada clase (un asesino solo puede ser DPS; un mago, Healer o DPS...). Se cambia aqui.
const ROLES_POR_CLASE = {
  guerrero:  ['tanque', 'dps'],
  arquero:   ['dps', 'soporte'],
  mago:      ['healer', 'dps'],
  asesino:   ['dps'],
  ingeniero: ['soporte', 'dps'],
};

const ROL_INFO = {
  tanque:  { maestro: 'Guardián', cargo: 'Maestro de Tanques', desc: 'Primera línea: aguantas los golpes y proteges al grupo. Mejoras: vida, armadura y resistencia al empuje; escudos y armaduras pesadas.' },
  dps:     { maestro: 'Maestro de armas', cargo: 'Maestro de DPS', desc: 'Daño: eliminas las amenazas rápido. Mejoras: daño, velocidad de ataque y críticos; armas y hechizos ofensivos.' },
  healer:  { maestro: 'Sanador', cargo: 'Maestro de Healers', desc: 'Curación: mantienes vivo al grupo. Mejoras: curación recibida, maná y recuperación; hechizos y objetos de sanación.' },
  soporte: { maestro: 'Intendente', cargo: 'Maestro de Soporte', desc: 'Apoyo: potencias al grupo con provisiones, herramientas, movilidad y utilidades. Mejoras: velocidad, suerte y resistencia.' },
};

// ---- clase y rol del jugador -----------------------------------------------------------------------------------------
function claseDe(p) {
  for (var i = 0; i < CLASES.length; i++) if (p.stages.has('origen_' + CLASES[i])) return CLASES[i];
  return null;
}
function rolesPermitidos(clase) { return ROLES_POR_CLASE[clase] || []; }
const nombreRol = (id) => global.ROLES[id].nombre;
const lista = (ids) => ids.map(nombreRol).join(' o ');

// ---- recompensas por clase, rol y nivel ------------------------------------------------------------------------------
// RECOMPENSAS[rol][clase][nivel] = [ [id, cantidad], ... ]      MEJORAS[rol][nivel] = [ [atributo, cantidad, operacion], ... ]
// Nivel 0 = kit de inicio al confirmar el rol; niveles 1..N = una por mision del capitulo de ese rol. Las mejoras son acumulativas.
const RECOMPENSAS = global.RECOMPENSAS_ROL || {};
const MEJORAS = global.MEJORAS_ROL || {};

/** UUID determinista a partir de una clave (para que cada mejora de atributo tenga el suyo y no se duplique) */
function uuidDe(clave) {
  var h = [0x811c9dc5, 0x1b873593, 0xcc9e2d51, 0x85ebca6b];
  for (var i = 0; i < clave.length; i++) {
    for (var k = 0; k < 4; k++) { h[k] = Math.imul(h[k] ^ clave.charCodeAt(i), 0x01000193 + k * 2) >>> 0; h[k] = (h[k] ^ (h[k] >>> 15)) >>> 0; }
  }
  var x = h.map((n) => ('00000000' + n.toString(16)).slice(-8)).join('');
  return x.slice(0, 8) + '-' + x.slice(8, 12) + '-' + x.slice(12, 16) + '-' + x.slice(16, 20) + '-' + x.slice(20, 32);
}

function darRecompensa(p, rol, nivel) {
  var clase = claseDe(p);
  var items = (RECOMPENSAS[rol] && RECOMPENSAS[rol][clase] && RECOMPENSAS[rol][clase][nivel]) || [];
  var dados = [];
  items.forEach((it) => {
    var stack = it[2] ? Item.of(it[0], it[1], it[2]) : Item.of(it[0], it[1]);
    if (stack.isEmpty()) { console.error('[roles] objeto desconocido en RECOMPENSAS: ' + it[0]); return; }
    p.give(stack);
    dados.push((it[1] > 1 ? it[1] + 'x ' : '') + stack.hoverName.string);
  });
  var mejoras = (MEJORAS[rol] && MEJORAS[rol][nivel]) || [];
  mejoras.forEach((m) => {
    var op = m[2] || 'add';
    p.server.runCommandSilent('attribute ' + p.username + ' ' + m[0] + ' modifier remove ' + uuidDe('rol:' + rol + ':' + nivel + ':' + m[0]));
    p.server.runCommandSilent('attribute ' + p.username + ' ' + m[0] + ' modifier add ' + uuidDe('rol:' + rol + ':' + nivel + ':' + m[0]) + ' "rol_' + rol + '_' + nivel + '" ' + m[1] + ' ' + op);
  });
  if (dados.length) p.tell(Text.green('Recompensa de ' + nombreRol(rol) + ' (' + NOMBRE_CLASE[clase] + '): ').append(Text.white(dados.join(', '))));
  if (mejoras.length) p.tell(Text.aqua('Mejora permanente de ' + nombreRol(rol) + ' aplicada.'));
}

// ---- maestros de rol (NPC de Easy NPC) ---------------------------------------------------------------------------------
// Skins de caballero que trae Easy NPC. Las armaduras/armas son solo de vitrina.
const NPC_DEF = {
  tanque:  { entidad: 'easy_npc:humanoid',      skin: 'KNIGHT_01',   color: '#55FFFF', armadura: ['iron_boots', 'iron_leggings', 'iron_chestplate', 'iron_helmet'], mano: ['iron_sword', 'shield'] },
  dps:     { entidad: 'easy_npc:humanoid',      skin: 'KNIGHT_02',   color: '#AA0000', armadura: ['chainmail_boots', 'chainmail_leggings', 'chainmail_chestplate', 'chainmail_helmet'], mano: ['diamond_sword', 'air'] },
  healer:  { entidad: 'easy_npc:humanoid_slim', skin: 'MAGE_01',     color: '#FF55FF', armadura: [], mano: ['golden_apple', 'air'] },
  soporte: { entidad: 'easy_npc:humanoid',      skin: 'SECURITY_01', color: '#FFAA00', armadura: ['leather_boots', 'leather_leggings', 'leather_chestplate', 'leather_helmet'], mano: ['bread', 'air'] },
};
const stackSnbt = (id) => id === 'air' ? '{}' : '{Count:1b,id:"minecraft:' + id + '"}';

/** NBT (SNBT) para /summon del maestro de un rol. El clic ejecuta /rol hablar <rol> <jugador> (@initiator lo sustituye Easy NPC). */
global.npcRolSnbt = (rol) => {
  var d = NPC_DEF[rol], i = ROL_INFO[rol];
  var armor = [0, 1, 2, 3].map((k) => d.armadura[k] ? stackSnbt(d.armadura[k]) : '{}').join(',');
  var nombre = JSON.stringify({ text: i.maestro + ' ', color: d.color, extra: [{ text: '(' + nombreRol(rol) + ')', color: 'white' }] });
  return '{Tags:["pony0n_rol_npc","pony0n_rol_' + rol + '"],CustomName:\'' + nombre.replace(/'/g, "\\'") + '\',CustomNameVisible:1b,Invulnerable:1b,PersistenceRequired:1b,'
    + 'ArmorItems:[' + armor + '],HandItems:[' + stackSnbt(d.mano[0]) + ',' + stackSnbt(d.mano[1]) + '],'
    + 'Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.0d},{Name:"minecraft:generic.knockback_resistance",Base:1.0d}],'
    + 'EasyNPCVersion:3,SkinData:{Name:"' + d.skin + '"},VariantType:"' + d.skin + '",'
    + 'ObjectiveData:{HasObjectives:1b,ObjectiveDataSet:[{Type:"LOOK_AT_PLAYER"}]},'
    + 'ActionData:{ActionEventSet:{ON_INTERACTION:[{Cmd:"/rol hablar ' + rol + ' @initiator",Type:"COMMAND"}]}}}';
};
global.NPC_ROL_ENTIDAD = (rol) => NPC_DEF[rol].entidad;
global.ROL_IDS = Object.keys(NPC_DEF);

// ---- dialogo del maestro ---------------------------------------------------------------------------------------------
function hablar(p, rol) {
  var info = ROL_INFO[rol], clase = claseDe(p), actual = global.rolDe(p);
  var cab = global.ROLES[rol].color('[' + info.maestro + '] ');
  if (actual) {
    if (actual === rol) p.tell(cab.append(Text.white('Ya recorres el camino del ' + nombreRol(rol) + '. Abre el libro de misiones: el capítulo de tu rol te guía y te da mejores equipos y mejoras.')));
    else p.tell(cab.append(Text.white('Elegiste el camino del ' + nombreRol(actual) + ' y no se puede cambiar. Tus misiones están en su capítulo.')));
    return;
  }
  if (!clase) { p.tell(cab.append(Text.white('Primero elige tu clase (Guerrero, Arquero, Mago, Asesino o Ingeniero). Vuelve cuando la tengas.'))); return; }
  var permitidos = rolesPermitidos(clase);
  if (permitidos.indexOf(rol) < 0) {
    p.tell(cab.append(Text.white('Un ' + NOMBRE_CLASE[clase] + ' no puede ser ' + nombreRol(rol) + '. Tu clase puede ser: ' + lista(permitidos) + '. Busca al maestro de ese rol.')));
    return;
  }
  p.persistentData.putString('rolPropuesto', rol);
  p.tell(cab.append(Text.white(info.desc)));
  p.tell(Text.yellow('¿Seguro que quieres ser ').append(global.ROLES[rol].color(nombreRol(rol))).append(Text.yellow('? ')).append(Text.red('NO PODRÁS CAMBIARLO')).append(Text.yellow(' y solo podrás hacer sus misiones. ')));
  p.tell(Text.green('[CONFIRMAR]').bold().clickRunCommand('/rol confirmar ' + rol).hover(Text.of('Elegir ' + nombreRol(rol) + ' para siempre'))
    .append(Text.of('   ')).append(Text.gray('[Pensarlo]').hover(Text.of('Cierra el dialogo; vuelve a hablar con el maestro cuando quieras'))));
}

function confirmar(p, rol) {
  if (global.rolDe(p)) { p.tell(Text.red('Ya tienes un rol y no se puede cambiar.')); return 0; }
  if (String(p.persistentData.getString('rolPropuesto')) !== rol) { p.tell(Text.red('Habla primero con el maestro de ese rol.')); return 0; }
  var clase = claseDe(p);
  if (!clase || rolesPermitidos(clase).indexOf(rol) < 0) { p.tell(Text.red('Tu clase no puede elegir ese rol.')); return 0; }
  p.persistentData.remove('rolPropuesto');
  p.stages.add('rol_' + rol);
  p.tell(Text.green('¡Ahora eres ').append(global.ROLES[rol].color(nombreRol(rol))).append(Text.green('! Abre el libro de misiones (capítulo de tu rol) para progresar.')));
  p.server.tell(Text.empty().append(Text.of('')).append(Text.gray('')).append(Text.yellow(p.username + ' ha elegido el camino del ')).append(global.ROLES[rol].color(nombreRol(rol))).append(Text.yellow('.')));
  darRecompensa(p, rol, 0);
  if (global.refrescarGremio) global.refrescarGremio(p);
  return 1;
}

// ---- comandos --------------------------------------------------------------------------------------------------------
ServerEvents.commandRegistry((event) => {
  const Commands = event.commands;
  const Arguments = event.arguments;
  const soloJugador = (ctx) => { const p = ctx.source.player; if (!p) ctx.source.sendFailure(Text.of('Solo un jugador puede usar este comando.')); return p; };
  const rolValido = (ctx, id) => { if (!global.ROLES[id]) { ctx.source.sendFailure(Text.of('Rol desconocido: ' + id + ' (' + Object.keys(global.ROLES).join(', ') + ')')); return false; } return true; };
  const arg = (ctx, n) => String(Arguments.STRING.getResult(ctx, n)).toLowerCase();

  event.register(Commands.literal('rol')
    .executes((ctx) => {
      const p = soloJugador(ctx);
      if (!p) return 0;
      const r = global.rolDe(p), c = claseDe(p);
      if (r) p.tell(Text.of('Tu rol: ').append(global.ROLES[r].color(nombreRol(r))).append(Text.of(' (' + (c ? NOMBRE_CLASE[c] : 'sin clase') + ')')));
      else if (c) p.tell(Text.of('Aún no tienes rol. Como ' + NOMBRE_CLASE[c] + ' puedes ser: ' + lista(rolesPermitidos(c)) + '. Habla con el maestro de rol de tu pueblo.'));
      else p.tell(Text.of('Elige primero tu clase; después podrás elegir un rol con los maestros de tu pueblo.'));
      return 1;
    })
    .then(Commands.literal('hablar')
      .then(Commands.argument('rol', Arguments.STRING.create(event))
        .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
          .executes((ctx) => {
            const id = arg(ctx, 'rol');
            if (!rolValido(ctx, id)) return 0;
            hablar(Arguments.PLAYER.getResult(ctx, 'jugador'), id);
            return 1;
          }))))
    .then(Commands.literal('confirmar')
      .then(Commands.argument('rol', Arguments.STRING.create(event))
        .executes((ctx) => {
          const p = soloJugador(ctx), id = arg(ctx, 'rol');
          if (!p || !rolValido(ctx, id)) return 0;
          return confirmar(p, id);
        })))
    .then(Commands.literal('reset').requires((src) => src.hasPermission(2))
      .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
        .executes((ctx) => {
          const p = Arguments.PLAYER.getResult(ctx, 'jugador');
          Object.keys(global.ROLES).forEach((id) => p.stages.remove('rol_' + id));
          p.persistentData.remove('rolPropuesto');
          if (global.refrescarGremio) global.refrescarGremio(p);
          ctx.source.sendSuccess(() => Text.green('Rol de ' + p.username + ' reiniciado (las mejoras de atributos ya entregadas se conservan).'), false);
          return 1;
        })))
    .then(Commands.literal('recompensa').requires((src) => src.hasPermission(2))
      .then(Commands.argument('rol', Arguments.STRING.create(event))
        .then(Commands.argument('nivel', Arguments.INTEGER.create(event))
          .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
            .executes((ctx) => {
              const id = arg(ctx, 'rol'), p = Arguments.PLAYER.getResult(ctx, 'jugador');
              if (!rolValido(ctx, id)) return 0;
              if (global.rolDe(p) !== id) { ctx.source.sendFailure(Text.of(p.username + ' no tiene el rol ' + id)); return 0; }
              darRecompensa(p, id, Arguments.INTEGER.getResult(ctx, 'nivel'));
              return 1;
            })))))
    .then(Commands.literal('npcs').requires((src) => src.hasPermission(2))
      .executes((ctx) => {
        if (!global.recolocarNpcsRol) { ctx.source.sendFailure(Text.of('gremios.js no está cargado.')); return 0; }
        ctx.source.sendSuccess(() => Text.of('Recolocando los maestros de rol en los pueblos colocados…'), false);
        global.recolocarNpcsRol(ctx.source.server);
        return 1;
      })));
});
